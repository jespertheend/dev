import { createPlugin } from "../types.js";
import * as rollup from "https://esm.sh/rollup@2.61.1?pin=v64";
import commonjs from "https://esm.sh/@rollup/plugin-commonjs@11.1.0?pin=v64";
import { nodeResolve } from "https://esm.sh/@rollup/plugin-node-resolve@13.0.6?pin=v64";
import { isFile } from "../util.js";

/**
 * @typedef EsmifyAction
 * @property {string} entryPointPath The path to the entrypoint of the files you wish to convert to an es module.
 * @property {string} outputPath The location to write the bundled es module.
 * @property {rollup.Plugin[]} [rollupPlugins] Extra plugins to be used when bundling the files with rollup.
 * @property {string[]} [ignoreImports] List of import identifiers that will be replaced with dummy modules.
 * You can use this to strip away imports that are only available in nodejs.
 * For instance, if you plan to use the output in a browser environment where "fs" is not available, you
 * can set this to ["fs"]. Any function call that depends on "fs" will fail, but at leat you will be able to use
 * parts of the package that don't depend on "fs".
 * @property {boolean} [keepSourceMapComments] By default source map comments are removed from the input files.
 * Since this action is meant to be used for converting third party libraries to something that can be used in
 * the browser, source maps are not generated. But if the input files contain source map comments these will still
 * be included in the output. This would likely cause warnings in the browser console. To work around this, these
 * comments are removed. You can set this to true to disable this behavior.
 */

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

export const esmifyPlugin = createPlugin("esmify", {
	/** @param {EsmifyAction} action */
	async checkCache(action) {
		const exists = await isFile(action.outputPath);
		return !exists;
	},
	/** @param {EsmifyAction} action */
	async run(action) {
		const actionPlugins = action.rollupPlugins || [];
		const plugins = [
			...actionPlugins,
			commonjs(),
			addHeader("// @ts-nocheck\n\n"),
			nodeResolve(),
		];
		if (action.ignoreImports) {
			plugins.push(ignore(action.ignoreImports));
		}
		if (!action.keepSourceMapComments) {
			plugins.push(removeSourceMaps());
		}
		const bundle = await rollup.rollup({
			input: action.entryPointPath,
			plugins,
		});
		await bundle.write({
			file: action.outputPath,
			format: "esm",
		});
	},
});
