import type { Args } from "jsr:@std/cli@1/parse-args";

/** The initialization options for a dash shell. */
interface DashOpts<T> {
	/** A initialization function */
	init?: (log: DashStreamInterface["log"]) => T;
	/** The input stream. */
	stdin?: ReadableStream;
	/** The output stream. */
	stdout?: WritableStream;
	/** A function that displays the prompt, given the state. */
	prompt?: (state: T) => string;
}

type DashArgs = Args & { __: string[] };

/** Describes the type of function accepted in the `register` API. */
type DashCommand<T> = (
	/** The command line arguments passed. Includes an `__` property containing the entire command split by spaces. */
	options: DashArgs,
	/** The current state passed around. */
	state: T,
	/** A function to log to the initialization parameter `stdout`. Mainly for testing purposes. */
	log: DashStreamInterface["log"]
	// biome-ignore lint/suspicious/noConfusingVoidType: functions without return values are typically typed as void
) => T | void;

/** The object returned after calling `dash()` */
interface DashWrapper<T> {
	/** The start function. Should be called after all commands have been registered. */
	start: () => Promise<void>;
	/** Register a command. `fn` is called when the first word of the prompt matches the `command` argument. See {@link DashCommand} for more info on the `fn` argument. */
	register: (command: string, fn: DashCommand<T>) => void;
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
	DashArgs,
	DashCommand,
	DashWrapper,
	DashStreamInterface,
};
