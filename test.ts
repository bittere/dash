import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { dash } from "./mod.ts";
import type { DashIO } from "./types.ts";

function buildIO(queue: string[]): [DashIO, () => string[]] {
	const op: string[] = [];

	return [
		{
			input: {
				read: () => `${queue.shift() ?? ""}\n`,
			},

			output: {
				write: (chunk: string) => {
					op.push(chunk);
					return;
				},
			},
		},

		() => {
			return op;
		},
	];
}

describe("dash startup", () => {
	it("creates a shell", () => {
		const shell = dash();
		expect(shell).toBeTruthy();
	});

	it("starts & exits the shell", async () => {
		const shell = dash();

		const [io, lines] = buildIO(["exit"]);
		await shell.start(io);

		expect(lines()[0]).toEqual("\n");
		expect(lines()[1]).toEqual("> ");
	});
});

describe("dash initialization", () => {
	it("sets the prompt", async () => {
		const [io, lines] = buildIO(["exit"]);

		const shell = dash({
			prompt: () => "sample prompt here: ",
		});
		await shell.start(io);

		expect(lines()[1]).toEqual("sample prompt here: ");
	});

	it("runs an init function", async () => {
		const [io, lines] = buildIO(["exit"]);

		const shell = dash({
			init: (io) => {
				io.output.write("test");
			},
		});
		await shell.start(io);

		expect(lines()[0]).toEqual("test");
	});

	it("runs an init function and sets init state", async () => {
		const [io, lines] = buildIO(["exit"]);

		const shell = dash({
			init: (io) => {
				io.output.write("test");
				return {
					foo: "bar",
				};
			},
		});
		await shell.start(io);

		expect(lines()[0]).toEqual("test");
	});
});

describe("dash register", () => {
	it("registers an echo command", async () => {
		const [io, lines] = buildIO(["echo hello", "exit"]);

		const shell = dash();

		shell.register("echo", (options, _, io) => {
			const toEcho = options.__.slice(1).join();
			io.output.write(toEcho);
		});

		await shell.start(io);

		expect(lines()[1]).toEqual("> ");
		expect(lines()[2]).toEqual("hello\n");
	});

	it("registers a state-logging command", async () => {
		const [io, lines] = buildIO(["log", "exit"]);

		const shell = dash({
			init: () => {
				return {
					foo: "bar",
				};
			},
		});

		shell.register("log", (_, state, io) => {
			io.output.write(JSON.stringify(state));
		});

		await shell.start(io);

		expect(lines()[2]).toBe('{"foo":"bar"}');
	});

	it("registers a state-modifying command", async () => {
		const [io, lines] = buildIO(["modify", "log", "exit"]);

		const shell = dash({
			init: () => {
				return {
					foo: "bar",
				};
			},
		});

		shell.register("modify", (_, state) => {
			return {
				...state,
				foo: "baz",
			};
		});

		shell.register("log", (_, state, io) => {
			io.output.write(JSON.stringify(state));
		});

		await shell.start(io);

		expect(lines()[3]).toBe("> ");
		expect(lines()[4]).toBe('{"foo":"baz"}');
	});
});
