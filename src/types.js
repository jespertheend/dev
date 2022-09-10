/**
 * @template TAction
 * @typedef DevPlugin
 * @property {string} name
 * @property {(action: TAction) => Promise<boolean> | boolean} [checkCache] A function that checks if the
 * main funciton needs to be run. If this returns false, `run` is skipped.
 * @property {(action: TAction) => Promise<void> | void} run The main function that performs the action.
 */

/**
 * Utility function for creating a plugin and automatically returning the correct type.
 * @template {string} TName
 * @template TAction
 * @template {Omit<DevPlugin<TAction>, "name">} T
 * @param {TName} name The name of the plugin/action.
 * @param {T} plugin
 */
export function createPlugin(name, plugin) {
	return { name, ...plugin };
}

/**
 * @template {DevPlugin<any>} TPlugin
 * @typedef {TPlugin extends any ? {name: TPlugin["name"]} & Parameters<TPlugin["run"]>[0] : never} PluginToAction
 */
