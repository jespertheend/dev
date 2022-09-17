import { dev } from "../../mod.js";
import { createPlugin } from "../../src/types.js";
import { assertSpyCall, assertSpyCalls, spy } from "https://deno.land/std@0.155.0/testing/mock.ts";

/**
 * @typedef CustomAction
 * @property {string} foo
 * @property {boolean} [bar]
 */

Deno.test({
	name: "Plugin without a `checkCache` function",
	async fn() {
		const customPlugin = createPlugin("custom", {
			/** @param {CustomAction} action */
			run(action) {},
		});

		const runSpy = spy(customPlugin, "run");
		await dev({
			plugins: [customPlugin],
			actions: [
				{
					type: "custom",
					foo: "foo",
					bar: true,
				},
			],
		});

		assertSpyCalls(runSpy, 1);
		assertSpyCall(runSpy, 0, {
			args: [
				{
					foo: "foo",
					bar: true,
				},
			],
		});
	},
});

Deno.test({
	name: "Plugin with `checkCache` returns true",
	async fn() {
		const customPlugin = createPlugin("custom", {
			checkCache: () => true,
			/** @param {CustomAction} action */
			run(action) {},
		});

		const runSpy = spy(customPlugin, "run");
		await dev({
			plugins: [customPlugin],
			actions: [
				{
					type: "custom",
					foo: "foo",
					bar: true,
				},
			],
		});

		assertSpyCalls(runSpy, 1);
		assertSpyCall(runSpy, 0, {
			args: [
				{
					foo: "foo",
					bar: true,
				},
			],
		});
	},
});

Deno.test({
	name: "Plugin with `checkCache` returns false",
	async fn() {
		const customPlugin = createPlugin("custom", {
			checkCache: () => false,
			/** @param {CustomAction} action */
			run(action) {},
		});

		const runSpy = spy(customPlugin, "run");
		await dev({
			plugins: [customPlugin],
			actions: [
				{
					type: "custom",
					foo: "foo",
					bar: true,
				},
			],
		});

		assertSpyCalls(runSpy, 0);
	},
});

Deno.test({
	name: "tasks with `ignore: true` get skipped",
	async fn() {
		const customPlugin = createPlugin("custom", {
			/** @param {CustomAction} action */
			run(action) {},
		});

		const runSpy = spy(customPlugin, "run");
		await dev({
			plugins: [customPlugin],
			actions: [
				{
					ignore: true,
					type: "custom",
					foo: "ignored",
				},
				{
					ignore: false,
					type: "custom",
					foo: "not ignored",
				},
				{
					type: "custom",
					foo: "ignore unset",
				},
			],
		});

		assertSpyCalls(runSpy, 2);
		assertSpyCall(runSpy, 0, {
			args: [
				{
					foo: "not ignored",
				},
			],
		});
		assertSpyCall(runSpy, 1, {
			args: [
				{
					foo: "ignore unset",
				},
			],
		});
	},
});
