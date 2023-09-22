import * as rollup from "npm:rollup@2.79.1";
import commonjs from "npm:@rollup/plugin-commonjs@22.0.2";
import { nodeResolve } from "npm:@rollup/plugin-node-resolve@14.1.0";
import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";

/**
 * Rollup plugin for replacing the content of certain imports with an empty object.
 * This is to strip a way imports that are only accessible via node such as "fs".
 * @param {string[]} ignoreList
 * @returns {rollup.Plugin}
 */
function ignore(ignoreList) {
	const emptyModuleId = "ignore_empty_module_placeholder";
	const emptyModule = "export default {}";
	return {
		name: "ignore-extern-fs",
		resolveId: (source) => {
			if (ignoreList.includes(source)) return emptyModuleId;
			return null;
		},
		load: (id) => {
			if (id.includes(emptyModuleId)) {
				return emptyModule;
			}
			return null;
		},
		transform: (code, id) => {
			if (!id.includes(emptyModuleId)) return null;
			return {
				code: emptyModule,
				map: null,
			};
		},
	};
}

/**
 * Rollup plugin for removing the # sourceMappingURL comment at the bottom of every file.
 * @returns {rollup.Plugin}
 */
function removeSourceMaps() {
	/**
	 * @param {string} code
	 */
	function executeRemoval(code) {
		return code.replace(/^\s*\/\/# sourceMappingURL=.*/gm, "");
	}
	return {
		name: "remove-source-maps",
		renderChunk(code, chunk) {
			return executeRemoval(code);
		},
		transform(code, id) {
			return executeRemoval(code);
		},
	};
}

/**
 * Rollup plugin for adding a string at the top of every file.
 * @param {string} headerCode
 * @returns {rollup.Plugin}
 */
function addHeader(headerCode) {
	return {
		name: "add-header",
		renderChunk(code, chunk) {
			return headerCode + code;
		},
	};
}

/**
 * Bundles a commonjs module into an es module, ready to be used in browsers.
 * Mileage may vary depending on which module you are trying to bundle.
 *
 * @param {Object} options
 * @param {string} options.entryPointPath The path to the entrypoint of the files you wish to convert to an es module.
 * @param {string} options.outFile The location to write the bundled es module.
 * @param {rollup.Plugin[]} [options.rollupPlugins] Extra plugins to be used when bundling the files with rollup.
 * @param {string[]} [options.ignoreImports] List of import identifiers that will be replaced with dummy modules.
 * You can use this to strip away imports that are only available in nodejs.
 * For instance, if you plan to use the output in a browser environment where "fs" is not available, you
 * can set this to ["fs"]. Any function call that depends on "fs" will fail, but at leat you will be able to use
 * parts of the package that don't depend on "fs".
 * @param {boolean} [options.keepSourceMapComments] By default source map comments are removed from the input files.
 * Since this action is meant to be used for converting third party libraries to something that can be used in
 * the browser, source maps are not generated. But if the input files contain source map comments these will still
 * be included in the output. This would likely cause warnings in the browser console. To work around this, these
 * comments are removed. You can set this to true to disable this behavior.
 * @param {boolean} [options.force] By default, if the file already exists, no bundle will be created.
 * You can set `force` to true to always bundle and overwrite the file.
 */
export async function esmify({
	outFile,
	entryPointPath,
	force,
	rollupPlugins,
	ignoreImports,
	keepSourceMapComments,
}) {
	const alreadyExists = await exists(outFile, { isFile: true });
	if (!force && alreadyExists) return;

	const actionPlugins = rollupPlugins || [];
	const plugins = [
		...actionPlugins,
		commonjs(),
		addHeader("// @ts-nocheck\n\n"),
		nodeResolve(),
	];
	if (ignoreImports) {
		plugins.push(ignore(ignoreImports));
	}
	if (!keepSourceMapComments) {
		plugins.push(removeSourceMaps());
	}
	const bundle = await rollup.rollup({
		input: entryPointPath,
		plugins,
	});
	await bundle.write({
		file: outFile,
		format: "esm",
	});
}
