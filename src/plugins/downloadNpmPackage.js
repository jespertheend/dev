import * as path from "https://deno.land/std@0.155.0/path/mod.ts";
import { createPlugin } from "../types.js";
import { isDirectory } from "../util.js";
import { downloadNpmPackage, splitNameAndVersion } from "https://deno.land/x/npm_fetcher@v0.1.0/mod.ts";

/**
 * @typedef DownloadNpmPackageAction
 * @property {string} package The name and version of the package, for example "rollup@2.79.0".
 * @property {string} [destination] The location relative to the cwd where the package
 * needs to be placed. When not provided, this defaults to `npm_packages/{packagename}/{packageversion}`.
 * @property {boolean} [downloadDependencies] Whether to download the dependencies of the package.json from the package.
 * These dependencies are placed in a node_modules directory inside the
 * created `destination` directory.
 * @property {boolean} [downloadDevDependencies] Whether to download the devdependencies of the package.json from the package.
 * These dependencies are placed in a node_modules directory inside the
 * created `destination` directory.
 */

/**
 * @param {DownloadNpmPackageAction} action
 */
function getDestination(action) {
	if (action.destination) return action.destination;
	const { version, packageName } = splitNameAndVersion(action.package);
	return path.join("npm_packages", packageName, version);
}

export const downloadNpmPackagePlugin = createPlugin("downloadNpmPackage", {
	/** @param {DownloadNpmPackageAction} action */
	async checkCache(action) {
		const exists = await isDirectory(getDestination(action));
		return !exists;
	},
	/** @param {DownloadNpmPackageAction} action */
	async run(action) {
		const destination = getDestination(action);
		const { version, packageName } = splitNameAndVersion(action.package);
		await downloadNpmPackage({
			packageName,
			version,
			destination,
			downloadDependencies: action.downloadDependencies,
			downloadDevDependencies: action.downloadDevDependencies,
		});
	},
});
