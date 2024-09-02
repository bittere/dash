import { describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";

import { dash } from "./mod.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

describe("dash startup", () => {
	it("creates a shell", () => {
		const shell = dash();
		expect(shell).toBeTruthy();
	});

	it("starts & exits the shell", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
		});
		await shell.start();

		expect(decoder.decode(lines[0])).toEqual("\n");
		expect(decoder.decode(lines[1])).toEqual("> ");
	});
});

describe("dash initialization", () => {
	it("sets the prompt", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
			prompt: () => "sample prompt here: ",
		});
		await shell.start();

		expect(decoder.decode(lines[1])).toEqual("sample prompt here: ");
	});

	it("sets the initMessage", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
			initMessage: "Welcome to dash!",
		});
		await shell.start();

		expect(decoder.decode(lines[0])).toEqual("Welcome to dash!");
		expect(decoder.decode(lines[2])).toEqual("> ");
	});

	it("sets the initState", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
			initState: { dir: "~" },
		});
		await shell.start();

		expect(decoder.decode(lines[1])).toEqual("> ");
	});
});

describe("dash register", () => {
	it("registers an echo command", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("echo hello\n"));
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
		});

		shell.register("echo", (options, _, log) => {
			const toEcho = options.__.slice(1).join();
			log(toEcho);
		});

		await shell.start();

		expect(decoder.decode(lines[1])).toEqual("> ");
		expect(decoder.decode(lines[2])).toEqual("hello");
	});

	it("registers a state-logging command", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("log\n"));
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
		});

		shell.register("log", (_, state, log) => {
			log(JSON.stringify(state));
		});

		await shell.start();

		expect(decoder.decode(lines[2])).toBe('{"dir":"~"}');
	});

	it("registers a state-modifying command", async () => {
		const stdin = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode("modify\n"));
				controller.enqueue(encoder.encode("log\n"));
				controller.enqueue(encoder.encode("exit\n"));
				controller.close();
			},
		});

		const lines: Uint8Array[] = [];
		const stdout = new WritableStream({
			write(chunk) {
				lines.push(chunk);
			},
		});

		const shell = dash({
			stdin,
			stdout,
		});

		shell.register("modify", (_, state) => {
			return {
				...state,
				foo: "bar",
			};
		});

		shell.register("log", (_, state, log) => {
			log(JSON.stringify(state));
		});

		await shell.start();

		expect(decoder.decode(lines[3])).toBe("> ");
		expect(decoder.decode(lines[4])).toBe('{"dir":"~","foo":"bar"}');
	});
});
