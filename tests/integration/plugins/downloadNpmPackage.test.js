import { dev } from "../../../mod.js";
import { assertEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.155.0/path/mod.ts";
import { isDirectory, isFile } from "../../../src/util.js";

Deno.test({
	name: "Basic package download",
	async fn() {
		const tmpDir = await Deno.makeTempDir();

		try {
			Deno.chdir(tmpDir);

			await dev({
				actions: [
					{
						type: "downloadNpmPackage",
						package: "rollup-plugin-resolve-url-objects@0.0.4",
						downloadDependencies: true,
					},
				],
			});

			const packagePath = path.resolve(tmpDir, "npm_packages/rollup-plugin-resolve-url-objects/0.0.4");
			const packageJsonPath = path.resolve(packagePath, "package.json");
			const packageJsonStr = await Deno.readTextFile(packageJsonPath);
			const packageJson = JSON.parse(packageJsonStr);
			assertEquals(packageJson.name, "rollup-plugin-resolve-url-objects");

			const nodeModulesPath = path.resolve(packagePath, "node_modules");
			const hasNodeModules = await isDirectory(nodeModulesPath);
			assertEquals(hasNodeModules, true);

			// Remove the package.json file to verify that it isn't generated a second time
			await Deno.remove(packageJsonPath);

			await dev({
				actions: [
					{
						type: "downloadNpmPackage",
						package: "rollup-plugin-resolve-url-objects@0.0.4",
						downloadDependencies: true,
					},
				],
			});
			const exists = await isFile(packageJsonPath);
			assertEquals(exists, false);
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});
