# dash

> A shell framework in Deno.

## Usage

See https://jsr.io/@bittere/dash.

### Register a Command

```ts
dash().register(
  command: string,
  fn: (options: Args, state: DashState, log: DashStreamInterface["log"]) => (DashState | void)
)
```

Register a command. The `fn` parameter may accept up to 2 parameters: the options (ie. the arguments given to the command) and the state (ie. the current modifiable dash state).

`options` is parsed using Deno's `parseArgs`, but with an additional `options.__` property that just contains the whole command split by spaces.

Example:

```ts
const shell = dash();
shell.register("echo", (options) => {
	const toEcho = options.__.slice(1);
	console.log(...toEcho);
});
/*
$ echo hello there
hello there
*/
```

### Start the Shell

```ts
await dash().start();
```

Starts a `while` loop that goes on prompting the user until one of the below is done:

- Ctrl+C or any other method to terminate the program
- Ctrl+D to close input
- The internal dash `exit` command is used to exit `break` out of the loop

Example:

```ts
const shell = dash();
shell.start();
```

## Principles

- The `state` object can be used to pass around state to the prompt function and other commands.
- Commands should handle all their arguments (eg. `help`) on their own. Dash is a _shell_ framework, not a CLI framework!
- The `log` function should be used if output is something other than stdout (eg. a `WritableStream` for tests). However, `console.log` may be used if the output is stdout.

## License

MIT with Commons Clause
See `LICENSE` for more information.
