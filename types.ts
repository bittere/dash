import type { Args } from "./deps.ts";

/** The input/output for a dash shell. */
interface DashIO {
	/** The input object. May be a stream, but doesn't have to. Any object with a `read` method is allowed. */
	input: {
		/** Any function that returns a string is allowed. */
		read: () => Promise<string> | string;
	};

	/** The output object. May be a stream, but doesn't have to. Any object with a `write` method is allowed. */
	output: {
		/** Any function that accepts a string is allowed. */
		write: (chunk: string) => Promise<void> | void;
	};
}

/** The initialization options for a dash shell. */
interface DashOpts<T> {
	/** An initialization function */
	init?: (streams: DashIO) => Promise<T> | T;
	/** A function that displays the prompt, given the state. */
	prompt?: (state: T) => Promise<string> | string;
}

type DashArgs = Args & { __: string[] };

/** Describes the type of function accepted in the `register` API. */
type DashCommand<T> = (
	/** The command line arguments passed. Includes an `__` property containing the entire command split by spaces. */
	options: DashArgs,
	/** The current state passed around. */
	state: T,
	/** The input/output. */
	streams: DashIO
	// biome-ignore lint/suspicious/noConfusingVoidType: functions without return values are typically typed as void
) => Promise<T> | T | void;

/** The object returned after calling `dash()` */
interface DashWrapper<T> {
	/** The start function. Should be called after all commands have been registered. Multiple start functions can be called on different input/output streams if needed. */
	start: (io: DashIO) => Promise<void>;
	/** Register a command. `fn` is called when the first word of the prompt matches the `command` argument. See {@link DashCommand} for more info on the `fn` argument. */
	register: (command: string, fn: DashCommand<T>) => void;
}

export type { DashIO, DashOpts, DashArgs, DashCommand, DashWrapper };
