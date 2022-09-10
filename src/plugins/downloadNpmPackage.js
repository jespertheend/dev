import * as path from "https://deno.land/std@0.155.0/path/mod.ts";
import { createPlugin } from "../types.js";
import { isDirectory } from "../util.js";
import { downloadNpmPackage } from "https://deno.land/x/npm_fetcher@v0.0.2/mod.ts";

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
 * @param {string} nameAndVersion
 */
function parsePackageName(nameAndVersion) {
	const splitPackage = nameAndVersion.split("@");
	if (splitPackage.length == 1) {
		throw new Error(
			`Failed to get package ${nameAndVersion}, package contains no version. If you wish to use the latest version, you can use ${nameAndVersion}@latest, although this is not recommended.`,
		);
	}
	const version = splitPackage.pop();
	if (!version) throw new Error("Failed to get package version.");
	const packageName = splitPackage.join("@");
	if (!packageName) throw new Error("Failed to get package name.");
	return { version, packageName };
}

/**
 * @param {DownloadNpmPackageAction} action
 */
function getDestination(action) {
	if (action.destination) return action.destination;
	const { version, packageName } = parsePackageName(action.package);
	return path.join("npm_packages", packageName, version);
}

export const downloadNpmPackagePlugin = createPlugin("donwloadNpmPackage", {
	/** @param {DownloadNpmPackageAction} action */
	async checkCache(action) {
		const exists = await isDirectory(getDestination(action));
		return !exists;
	},
	/** @param {DownloadNpmPackageAction} action */
	async run(action) {
		const destination = getDestination(action);
		const { version, packageName } = parsePackageName(action.package);
		await downloadNpmPackage({
			packageName,
			version,
			destination,
			downloadDependencies: action.downloadDependencies,
			downloadDevDependencies: action.downloadDevDependencies,
		});
	},
});
