import * as fs from "https://deno.land/std@0.155.0/fs/mod.ts";
import { createPlugin } from "../types.js";

/**
 * @typedef TsNocheckAction
 * @property {string} path The file or directory for which '@ts-nocheck' should be added to the files.
 * @property {boolean} [excludeJs] Set to true if you don't want '@ts-nocheck' to be added to .js files.
 * @property {boolean} [excludeTs] Set to true if you don't want '@ts-nocheck' to be added to .ts files.
 */

/**
 * @param {string} filePath
 */
async function addTsNocheck(filePath) {
	let content = await Deno.readTextFile(filePath);
	if (content.split("\n").find((line) => line.startsWith("// @ts-nocheck"))) return;
	content = "// @ts-nocheck\n\n" + content;
	await Deno.writeTextFile(filePath, content);
}

export const addTsNocheckPlugin = createPlugin("addTsNocheck", {
	/** @param {TsNocheckAction} action */
	async run(action) {
		for await (const entry of fs.walk(action.path)) {
			if (entry.isFile) {
				if (entry.name.endsWith(".ts") && !action.excludeTs) {
					await addTsNocheck(entry.path);
				}
				if (entry.name.endsWith(".js") && !action.excludeJs) {
					await addTsNocheck(entry.path);
				}
			}
		}
	},
});
