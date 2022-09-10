import { downloadFilePlugin } from "./plugins/downloadFile.js";

export const defaultPlugins = [
	downloadFilePlugin,
];

/**
 * @template {any[]} T
 * @typedef {T extends (infer A)[] ? A : never} DefaultPluginsUnionHelper
 */

/**
 * @typedef {DefaultPluginsUnionHelper<typeof defaultPlugins>} DefaultPluginsUnion
 */
