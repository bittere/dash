import { parseArgs } from "./deps.ts";
import type {
	DashArgs,
	DashCommand,
	DashIO,
	DashOpts,
	DashWrapper,
} from "./types.ts";

/**
 * Creates a `dash` wrapper.
 * @param {DashOpts} [opts] The options to use.
 * @returns {DashWrapper} The `dash` wrapper. Check out the README for more information.
 */
function dash<T>(opts?: DashOpts<T>): DashWrapper<T> {
	const commands = new Map<string, DashCommand<T>>();

	return {
		/**
		 * Registers a command to the `dash` shell.
		 * @param {string} command The command name.
		 * @param {DashCommand} fn The function to run when the command is called.
		 */
		register: (command: string, fn: DashCommand<T>) => {
			commands.set(command, fn);
		},

		/**
		 * Starts the `dash` shell.
		 * This function will not return until the user ends the input/program (eg. with Ctrl+D, Ctrl+C or with the built-in `exit` command.)
		 * @returns {Promise<void>}
		 */
		start: async (io: DashIO): Promise<void> => {
			let state: T = (await opts?.init?.(io)) ?? ({} as T);

			while (true) {
				io.log("\n");

				const userCommand = await io.question(
					(await opts?.prompt?.(state)) ?? "> "
				);

				if (!userCommand) {
					continue;
				}

				const commandChunks = userCommand.split(" ");
				const commandName = commandChunks[0].trim();

				if (commandName === "exit") {
					break;
				}

				const args: DashArgs = parseArgs(commandChunks);
				args.__ = commandChunks;

				if (commands.get(commandName)) {
					// why are we passing the `rw.log` function here?
					// when testing, it is useful to send the data to the `stdout` initialzation option instead of `stdout` of the process
					// console.log still totally works though tests may fail

					state =
						// biome-ignore lint/style/noNonNullAssertion: we're checking that the command exists in the above if block
						(await commands.get(commandName)!(args, state, io)) || state;
				} else {
					io.log(`dash: command not found: ${commandName}`);
				}
			}
		},
	};
}

export { dash };
