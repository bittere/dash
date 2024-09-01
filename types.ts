import type { Args } from "jsr:@std/cli@1/parse-args";

type DashState = {
	dir: string;
	[key: string]: unknown;
};

interface DashOpts {
	initMessage?: string;
	initState?: DashState;
	prompt?: (state: DashState) => string;
}

// biome-ignore lint/suspicious/noConfusingVoidType: functions without return values are typically typed as void
type DashCommand = (options: Args, state: DashState) => DashState | void;

interface DashWrapper {
	start: () => void;
	register: (command: string, fn: DashCommand) => void;
}

export type { DashOpts, DashState, DashCommand, DashWrapper };
