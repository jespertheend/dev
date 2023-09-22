import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";

/**
 * @param {Object} options
 * @param {string} options.url The file url where the content is hosted.
 * @param {string} options.destination The path (relative to the current working directory) where the file will be written to.
 * @param {boolean} [options.force] By default, if the file already exists, no file will be downloaded.
 * You can set `force` to true to always download and overwrite the file.
 */
export async function downloadFile({
	url,
	destination,
	force = false,
}) {
	if (
		!force && await exists(destination, {
			isFile: true,
		})
	) return;

	const response = await fetch(url);
	const file = await Deno.open(destination, {
		write: true,
		create: true,
	});
	if (!response.body) {
		throw new Error(`Failed to download "${url}", response body contained no content.`);
	}
	await response.body.pipeTo(file.writable);
}
