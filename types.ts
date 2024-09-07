import type { Args } from "./deps.ts";

/** The input/output for a dash shell. */
interface DashIO {
	/** A function that prompts the user and returns the input. */
	question: (question: string) => Promise<string> | string;
	/** A function that logs data. */
	log: (data: string) => void;
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
