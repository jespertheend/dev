import { copy, readerFromStreamReader } from "https://deno.land/std@0.155.0/streams/mod.ts";
import { createPlugin } from "../types.js";
import { isFile } from "../util.js";

/**
 * @typedef DownloadFileAction
 * @property {string} url The url to download the file from.
 * @property {string} destination The location relative to the cwd where the file
 * needs to be placed.
 */

export const downloadFilePlugin = createPlugin("downloadFile", {
	/** @param {DownloadFileAction} action */
	async checkCache(action) {
		const exists = await isFile(action.destination);
		return !exists;
	},
	/** @param {DownloadFileAction} action */
	async run(action) {
		const response = await fetch(action.url);
		const file = await Deno.open(action.destination, {
			write: true,
			createNew: true,
		});
		if (!response.body) {
			throw new Error(`Failed to download ${action.url}, response body contained no content.`);
		}
		await copy(readerFromStreamReader(response.body.getReader()), file);
		file.close();
	},
});
