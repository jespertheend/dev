import { defaultPlugins } from "./src/defaultPlugins.js";

/**
 * @typedef Action
 * @property {string} action
 */

/**
 * @template {import("./src/types.js").DevPlugin<any>} [TPlugins = never]
 * @typedef DevOptions
 * @property {TPlugins[]} [plugins]
 * @property {import("./src/types.js").PluginToAction<TPlugins | import("./src/defaultPlugins.js").DefaultPluginsUnion>[]} actions
 */

/**
 * @template {import("./src/types.js").DevPlugin<any>} [TPlugins = never]
 * @param {DevOptions<TPlugins>} options
 */
export async function dev(options) {
	/** @type {Map<string, import("./src/types.js").DevPlugin<any>>} */
	const plugins = new Map();
	for (const plugin of defaultPlugins) {
		plugins.set(plugin.name, plugin);
	}
	if (options.plugins) {
		for (const plugin of options.plugins) {
			plugins.set(plugin.name, plugin);
		}
	}

	for (const action of options.actions) {
		const castAction = /** @type {import("./src/types.js").PluginToAction<any>} */ (action);
		const plugin = plugins.get(castAction.name);
		if (!plugin) throw new Error(`No plugin added for the action "${castAction.name}".`);

		// We strip the name property from the action to make it match the type
		// of the plugin functions.
		const namelessAction = { ...castAction };
		delete namelessAction.name;

		let needsRun = true;
		if (plugin.checkCache) {
			const result = await plugin.checkCache(namelessAction);
			if (!result) {
				needsRun = false;
			}
		}
		if (needsRun) {
			await plugin.run(namelessAction);
		}
	}
}
