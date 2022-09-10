// These tests only check if the types of arguments are correct. So nothing
// needs to be run. Types will be verified with `deno task check`.

import { dev } from "../../mod.js";
import { createPlugin } from "../../src/types.js";

// Default actions
dev({
	actions: [
		{
			type: "downloadFile",
			url: "",
			destination: "",
			// @ts-expect-error
			invalidProperty: true,
		},
		{
			// @ts-expect-error
			type: "invalid name",
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
			type: "custom",
			foo: "",
			bar: true,
		},
		// @ts-expect-error
		{
			type: "custom",
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
			type: "downloadFile",
			url: "",
			destination: "",
			// @ts-expect-error
			invalidProperty: true,
		},
		{
			// @ts-expect-error
			type: "invalid name",
		},
	],
});
