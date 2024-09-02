import { parseArgs } from "./deps.ts";
import type {
	DashArgs,
	DashCommand,
	DashOpts,
	DashState,
	DashStreamInterface,
	DashWrapper,
} from "./types.ts";

/**
 * Creates a `DashStreamInterface` from a given readable and writable stream.
 *
 * A `DashStreamInterface` is an object with a `question` method and a `log` method.
 * The `question` method takes a string, encodes it with a TextEncoder, writes it to the given writable stream, waits for a string to be written to the given readable stream, decodes it with a TextDecoder, and returns the decoded string.
 * The `log` method takes a string, encodes it with the given encoder, and writes it to the given writable stream.
 *
 * @param {ReadableStream} input The readable stream to read from.
 * @param {WritableStream} output The writable stream to write to.
 *
 * @returns {DashStreamInterface} The `DashStreamInterface` object.
 */
function createInterface(
	input: ReadableStream,
	output: WritableStream
): DashStreamInterface {
	const reader = input.getReader();
	const writer = output.getWriter();

	const encoder = new TextEncoder();
	const decoder = new TextDecoder("utf-8");

	return {
		question: async (line: string) => {
			// a writable stream to avoid the newline when using console.log
			writer.write(encoder.encode(line));
			const op = await reader.read();
			return decoder.decode(op.value).trim();
		},
		log: (line: string) => {
			writer.write(encoder.encode(line));
		},
	};
}

/**
 * Creates a `dash` wrapper.
 * @param {DashOpts} [opts] The options to use.
 * @returns {DashWrapper} The `dash` wrapper. Check out the README for more information.
 */
function dash(opts?: DashOpts): DashWrapper {
	const commands = new Map<string, DashCommand>();
	let state =
		opts?.initState ||
		({
			dir: "~",
		} as DashState);

	const rw = createInterface(
		opts?.stdin ?? Deno.stdin.readable,
		opts?.stdout ?? Deno.stdout.writable
	);

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
		 * @returns {Promise<void>}
		 */
		start: async (): Promise<void> => {
			if (opts?.initMessage) {
				rw.log(opts?.initMessage);
			}

			while (true) {
				rw.log("\n");
				const userCommand = await rw.question(
					opts?.prompt?.(state) ?? "> "
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

					// biome-ignore lint/style/noNonNullAssertion: we're checking that the command exists in the above if block
					state = commands.get(commandName)!(args, state, rw.log) || state;
				} else {
					rw.log(`dash: command not found: ${commandName}`);
				}
			}
		},
	};
}

export { dash };
