import { parseArgs } from "./deps.ts";
import type {
	DashCommand,
	DashOpts,
	DashState,
	DashWrapper,
} from "./types.ts";

/**
 * Creates a `dash` wrapper.
 * @param {DashOpts} [opts] The options to use.
 * @returns {DashWrapper} The `dash` wrapper. Check out the README for more information.
 */
function dash(opts?: DashOpts): DashWrapper {
	const commands = new Map<string, DashCommand>();
	let state: DashState = opts?.initState || {
		dir: "~",
	};

	return {
		/**
		 * Registers a command to the `dash` shell.
		 * @param {string} command The command name.
		 * @param {DashCommand} fn The function to run when the command is called.
		 */
		register: (command: string, fn: DashCommand) => {
			commands.set(command, fn);
		},

		/**
		 * Starts the `dash` shell.
		 * This function will not return until the user ends the input/program (eg. with Ctrl+D, Ctrl+C or with the built-in `exit` command.)
		 * @returns {void}
		 */
		start: (): void => {
			if (opts?.initMessage) {
				console.log(opts?.initMessage);
			}

			while (true) {
				console.log();
				const userCommand = globalThis.prompt(
					opts?.prompt?.(state) ?? ">"
				);

				if (!userCommand) {
					continue;
				}

				const commandChunks = userCommand.split(" ");
				const commandName = commandChunks[0].trim();

				if (commandName === "exit") {
					break;
				}

				if (commandName === "clear") {
					console.clear();
					continue;
				}

				const args = parseArgs(commandChunks);
				args.__ = commandChunks;

				if (commands.get(commandName)) {
					// biome-ignore lint/style/noNonNullAssertion: we're checking that the command exists in the above if block
					state = commands.get(commandName)!(args, state) || state;
				} else {
					console.log(`dash: command not found: ${commandName}`);
				}
			}
		},
	};
}

export default dash;
