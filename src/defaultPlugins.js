import { downloadFilePlugin } from "./plugins/downloadFile.js";
import { downloadNpmPackagePlugin } from "./plugins/downloadNpmPackage.js";

export const defaultPlugins = [
	downloadFilePlugin,
	downloadNpmPackagePlugin,
];

/**
 * @template {any[]} T
 * @typedef {T extends (infer A)[] ? A : never} DefaultPluginsUnionHelper
 */

/**
 * @typedef {DefaultPluginsUnionHelper<typeof defaultPlugins>} DefaultPluginsUnion
 */
