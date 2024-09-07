import { dash, type DashIO } from "../mod.ts";

const shell = dash();

const reader = Deno.stdin.readable.getReader();
const io: DashIO = {
	input: {
		async read() {
			return new TextDecoder("utf-8").decode((await reader.read()).value);
		},
	},

	output: {
		write(chunk) {
			Deno.stdout.writeSync(new TextEncoder().encode(chunk));
		},
	},
};

await shell.start(io);
