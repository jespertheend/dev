/**
 * @typedef DevPlugin
 * @property {string} type
 * @property {(action: TAction) => Promise<boolean> | boolean} [checkCache] A function that checks if the
 * main funciton needs to be run. If this returns false, `run` is skipped.
 * @property {(action: TAction) => Promise<void> | void} run The main function that performs the action.
 * @template TAction
 */

/**
 * Utility function for creating a plugin and automatically returning the correct type.
 * @template {string} TName
 * @template TAction
 * @template {Omit<DevPlugin<TAction>, "type">} T
 * @param {TName} name The name of the plugin/action, this is what users will
 * use in the `type` property of an action.
 * @param {T} plugin The plugin implementation.
 */
export function createPlugin(name, plugin) {
	return { type: name, ...plugin };
}

/**
 * @typedef ActionBase
 * @property {boolean} [ignore] When set, the action won't be run.
 */

/**
 * @template {DevPlugin<any>} TPlugin
 * @typedef {ActionBase & (TPlugin extends any ? {type: TPlugin["type"]} & Parameters<TPlugin["run"]>[0] : never)} PluginToAction
 */
