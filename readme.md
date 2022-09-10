# dev

This module allows you to run several actions and cache the result. The idea is to use this as a 'first time setup'
script within the script you use for starting a local development server.

For instance, say you have a development script `dev.ts` that starts a local http/websocket server or starts watching
some files. But your project depends on some remote files, maybe you have some client code that runs in the browser for
example. You could create a separate script like `install.ts` or `init.ts`, and ask all contributors to run this when
they start working on the project. But contributors will have to run it again every time something is changed.

So instead, this module allows you to perform these steps inside the `dev.ts` script. So that things are kept up to date
at all times. To prevent these steps from being run every time you start `dev.ts`, the results are cached, and only if
something is changed will steps be performed again.

## Usage

```js
import { dev } from "https://deno.land/x/dev/mod.js";
import { serve } from "https://deno.land/std/http/server.ts";
import { serveDir } from "https://deno.land/std/http/file_server.ts";

await dev({
	actions: [
		{
			name: "downloadFile",
			url: "https://example.com/shim.js",
			destination: "path/to/client/deps/shim.js",
		},
	],
});

serve((req) => {
	return serveDir(req, {
		fsRoot: "path/to/client",
	});
});
```
