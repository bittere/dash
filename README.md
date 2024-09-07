<img src="https://github.com/user-attachments/assets/62bcf8a1-26f6-474c-8faa-690951fd64f6" alt="dash logo" style="width: 80%; max-width: 900px;" />

# dash

[![JSR](https://jsr.io/badges/@bittere/dash)](https://jsr.io/@bittere/dash)

> A shell framework in Deno.

[WIP] For more examples, the `examples/` directory is there to help!

## Usage

### Installation

See https://jsr.io/@bittere/dash.

### Initialization

```ts
dash<T>({
  init: (log: DashStreamInterface["logs"]) => T;
  prompt?: (state: DashState) => string;
})
```

All options are, well, optional.
`init` is run before starting the shell. The object returned by `init` (of type `T`) is used as the default state. If `init` is not present, the default state is `{}`.
`prompt` is a function that displays the prompt, given the state.

`T` is the type of state used by the functions.

### Register a Command

```ts
dash<T>().register(
  command: string,
  fn: (options: Args, state: T, io: DashIO) => (T | void)
)
```

Register a command. The `fn` function may accept up to 3 parameters:

- the options (ie. the arguments given to the command)
- the state (ie. the current modifiable dash state).
- a `DashIO` object that contains the input/output objects.

`options` is parsed using Deno's `parseArgs`, but with an additional `options.__` property that just contains the whole command split by spaces.

Example:

```ts
const shell = dash();
shell.register("echo", (options, _, io) => {
	const toEcho = options.__.slice(1);
	io.output.write(...toEcho);
});
/*
$ echo hello there
hello there
*/
```

### Start the Shell

```ts
await dash().start(io: DashIO);
```

Starts a `while` loop on a given IO that continues prompting the user on the given IO until:

- The internal dash `exit` command is used to `break` out of the loop
- An error is raised by a command

Example:

```ts
// An example using Deno's `stdin` and `stdout` streams.
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

await shell.start();
```

## Principles

- The `state` object can be used to pass around state to the prompt function and other commands.
- Commands should handle all their arguments (eg. `help`) on their own. Dash is a _shell_ framework, not a CLI framework!
- `DashIO.input` and `DashIO.output` don't have to be actual streams, but rather can be any two objects implementing a `read` and `write` method respectively. They may use streams internally, or maybe HTTP requests - whatever it is, as long as `read` returns a string and `write` accepts a string as a parameter, it's good enough for Dash.

## License

MIT with Commons Clause. See `LICENSE` for more information.
