import {
	urlToPathName,
	vendor as vendorModule,
} from "https://raw.githubusercontent.com/jespertheend/vendor/main/mod.js";
import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";

/**
 * @typedef VendorOptionsExtra
 * @property {boolean} [force] By default, the entry points which already exists won't be downloaded.
 * You can set `force` to true to always download all of the entry points.
 * Only the existence of the entry points are checked, so if the contents are changed
 * or any of its dependency files are removed, they still won't be overwritten with the accurate contents.
 * @property {boolean} [quiet] Supress logging, defaults to false.
 */

/**
 * @typedef {Parameters<typeof vendorModule>[0] & VendorOptionsExtra} VendorOptions
 */

/**
 * Vendors a set of entry points and all of their dependencies.
 * All files will be written to disk unless their main entry point already exists.
 * @param {VendorOptions} options
 */
export async function vendor(options) {
	let entryPoints = [];
	if (options.force) {
		entryPoints = options.entryPoints;
	} else {
		for (const entryPoint of options.entryPoints) {
			const outDir = urlToPathName(entryPoint, options.outDir);
			const alreadyExists = await exists(outDir, { isFile: true });
			if (!alreadyExists) {
				entryPoints.push(entryPoint);
			}
		}
	}
	for (const entryPoint of entryPoints) {
		console.log(`Downloading ${entryPoint} and its dependencies...`);
	}
	const newOptions = {
		...options,
		entryPoints,
	};
	await vendorModule(newOptions);
}
