import { dash, type DashIO } from "../mod.ts";

const shell = dash();

const io: DashIO = {
	input: {
		read: async () => {
			for await (const line of console) {
				return line;
			}
		},
	},

	output: {
		write: console.log,
	},
};

await shell.start(io);
