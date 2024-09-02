import type { Args } from "jsr:@std/cli@1/parse-args";

/** Represents the `state` object passed around command functions. */
type DashState = {
	/** Mandatory: the current `dir` shown to the prompt. */
	dir: string;
	/** Any other data. */
	[key: string]: unknown;
};

/** The initialization options for a dash shell. */
interface DashOpts {
	/** A message displayed when the shell is started. */
	initMessage?: string;
	/** The default state to start with. */
	initState?: DashState;
	/** The input stream. */
	stdin?: ReadableStream;
	/** The output stream. */
	stdout?: WritableStream;
	/** A function that displays the prompt, given the state. */
	prompt?: (state: DashState) => string;
}

/** Describes the type of function accepted in the `register` API. */
type DashCommand = (
	/** The command line arguments passed. Includes an `__` property containing the entire command split by spaces. */
	options: Args & { __: string[] },
	/** The current state passed around. */
	state: DashState,
	/** A function to log to the initialization parameter `stdout`. Mainly for testing purposes. */
	log: DashStreamInterface["log"]
	// biome-ignore lint/suspicious/noConfusingVoidType: functions without return values are typically typed as void
) => DashState | void;

/** The object returned after calling `dash()` */
interface DashWrapper {
	/** The start function. Should be called after all commands have been registered. */
	start: () => Promise<void>;
	/** Register a command. `fn` is called when the first word of the prompt matches the `command` argument. See {@link DashCommand} for more info on the `fn` argument. */
	register: (command: string, fn: DashCommand) => void;
}

/** An internal interface used for input/output. */
interface DashStreamInterface {
	/** Logs a line to stdout, waits for response from stdin and returns it. */
	question: (line: string) => Promise<string>;
	/** Simply logs a line to stdout. */
	log: (line: string) => void;
}

export type {
	DashOpts,
	DashState,
	DashCommand,
	DashWrapper,
	DashStreamInterface,
};
