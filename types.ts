import type { Args } from "jsr:@std/cli@1/parse-args";

type DashState = {
	dir: string;
	[key: string]: unknown;
};

interface DashOpts {
	initMessage?: string;
	initState?: DashState;
	stdin?: ReadableStream;
	stdout?: WritableStream;
	prompt?: (state: DashState) => string;
}

type DashCommand = (
	options: Args,
	state: DashState,
	log: DashStreamInterface["log"]
	// biome-ignore lint/suspicious/noConfusingVoidType: functions without return values are typically typed as void
) => DashState | void;

interface DashWrapper {
	start: () => Promise<void>;
	register: (command: string, fn: DashCommand) => void;
}

interface DashStreamInterface {
	question: (line: string) => Promise<string>;
	log: (line: string) => void;
}

export type {
	DashOpts,
	DashState,
	DashCommand,
	DashWrapper,
	DashStreamInterface,
};
