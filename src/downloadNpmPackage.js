import * as path from "https://deno.land/std@0.155.0/path/mod.ts";
import {
	downloadNpmPackage as downloadPackage,
	splitNameAndVersion,
} from "https://deno.land/x/npm_fetcher@v0.1.0/mod.ts";
import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";

/**
 * @param {Object} options
 * @param {string} options.package The name and version of the package, for example "rollup@2.79.0".
 * @param {string} [options.destination] The location relative to the cwd where the package
 * needs to be placed. When not provided, this defaults to `npm_packages/{packagename}/{packageversion}`.
 * @param {boolean} [options.downloadDependencies] Whether to download the dependencies of the package.json from the package.
 * These dependencies are placed in a node_modules directory inside the
 * created `destination` directory.
 * @param {boolean} [options.downloadDevDependencies] Whether to download the devdependencies of the package.json from the package.
 * These dependencies are placed in a node_modules directory inside the
 * created `destination` directory.
 * @param {boolean} [options.force] By default, if the directory already exists, no package will be downloaded.
 * You can set `force` to true to always download and overwrite the directory.
 */
export async function downloadNpmPackage(options) {
	let destination = options.destination;
	if (!destination) {
		const { version, packageName } = splitNameAndVersion(options.package);
		destination = path.join("npm_packages", packageName, version);
	}

	const alreadyExists = await exists(destination, {
		isDirectory: true,
	});
	if (alreadyExists) {
		if (options.force) {
			await Deno.remove(destination, { recursive: true });
		} else {
			return;
		}
	}

	const { version, packageName } = splitNameAndVersion(options.package);
	await downloadPackage({
		packageName,
		version,
		destination,
		downloadDependencies: options.downloadDependencies,
		downloadDevDependencies: options.downloadDevDependencies,
	});
}
