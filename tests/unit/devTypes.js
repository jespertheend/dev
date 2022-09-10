// These tests only check if the types of arguments are correct. So nothing
// needs to be run. Types will be verified with `deno task check`.

import { dev } from "../../mod.js";
import { createPlugin } from "../../src/types.js";

// Default actions
dev({
	actions: [
		{
			name: "downloadFile",
			url: "",
			destination: "",
			// @ts-expect-error
			invalidProperty: true,
		},
		{
			// @ts-expect-error
			name: "invalid name",
		},
	],
});

// Custom plugins
/**
 * @typedef CustomPluginAction
 * @property {string} foo
 * @property {boolean} bar
 */
const customPlugin = createPlugin("custom", {
	/** @param {CustomPluginAction} action */
	run(action) {},
});
dev({
	plugins: [customPlugin],
	actions: [
		{
			name: "custom",
			foo: "",
			bar: true,
		},
		// @ts-expect-error
		{
			name: "custom",
			foo: "",
			// bar is deliberately missing
		},
	],
});

// empty plugins array
dev({
	plugins: [],
	actions: [
		{
			name: "downloadFile",
			url: "",
			destination: "",
			// @ts-expect-error
			invalidProperty: true,
		},
		{
			// @ts-expect-error
			name: "invalid name",
		},
	],
});
