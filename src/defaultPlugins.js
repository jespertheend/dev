import { downloadFilePlugin } from "./plugins/downloadFile.js";
import { downloadNpmPackagePlugin } from "./plugins/downloadNpmPackage.js";
import { esmifyPlugin } from "./plugins/esmify.js";
import { addTsNocheckPlugin } from "./plugins/tsNocheck.js";

export const defaultPlugins = [
	downloadFilePlugin,
	downloadNpmPackagePlugin,
	esmifyPlugin,
	addTsNocheckPlugin,
];

/**
 * @template {any[]} T
 * @typedef {T extends (infer A)[] ? A : never} DefaultPluginsUnionHelper
 */

/**
 * @typedef {DefaultPluginsUnionHelper<typeof defaultPlugins>} DefaultPluginsUnion
 */
