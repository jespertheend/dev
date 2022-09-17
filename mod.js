import { defaultPlugins } from "./src/defaultPlugins.js";

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
		plugins.set(plugin.type, plugin);
	}
	if (options.plugins) {
		for (const plugin of options.plugins) {
			plugins.set(plugin.type, plugin);
		}
	}

	for (const action of options.actions) {
		const castAction = /** @type {import("./src/types.js").PluginToAction<any>} */ (action);
		if (castAction.ignore) continue;
		const plugin = plugins.get(castAction.type);
		if (!plugin) throw new Error(`No plugin added for the action "${castAction.type}".`);

		// We strip the type property from the action to make it match the type
		// of the plugin functions.
		const typelessAction = { ...castAction };
		delete typelessAction.type;
		delete typelessAction.ignore;

		let needsRun = true;
		if (plugin.checkCache) {
			const result = await plugin.checkCache(typelessAction);
			if (!result) {
				needsRun = false;
			}
		}
		if (needsRun) {
			await plugin.run(typelessAction);
		}
	}
}
