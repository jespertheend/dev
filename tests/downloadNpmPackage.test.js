import { assertEquals } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.202.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";
import { downloadNpmPackage } from "../src/downloadNpmPackage.js";

Deno.test({
	name: "Basic package download",
	async fn() {
		const tmpDir = await Deno.makeTempDir();

		try {
			Deno.chdir(tmpDir);

			await downloadNpmPackage({
				package: "rollup-plugin-resolve-url-objects@0.0.4",
				downloadDependencies: true,
			});

			const packagePath = path.resolve(tmpDir, "npm_packages/rollup-plugin-resolve-url-objects/0.0.4");
			const packageJsonPath = path.resolve(packagePath, "package.json");
			const packageJsonStr = await Deno.readTextFile(packageJsonPath);
			const packageJson = JSON.parse(packageJsonStr);
			assertEquals(packageJson.name, "rollup-plugin-resolve-url-objects");

			const nodeModulesPath = path.resolve(packagePath, "node_modules");
			const hasNodeModules = await exists(nodeModulesPath, { isDirectory: true });
			assertEquals(hasNodeModules, true);

			// Remove the package.json file to verify that it isn't generated a second time
			await Deno.remove(packageJsonPath);

			await downloadNpmPackage({
				package: "rollup-plugin-resolve-url-objects@0.0.4",
				downloadDependencies: true,
			});

			const fileExists = await exists(packageJsonPath, { isFile: true });
			assertEquals(fileExists, false);

			// Download with force overwrites the package
			await downloadNpmPackage({
				package: "rollup-plugin-resolve-url-objects@0.0.4",
				downloadDependencies: true,
				force: true,
			});

			const fileExists2 = await exists(packageJsonPath, { isFile: true });
			assertEquals(fileExists2, true);
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});

Deno.test({
	name: "Download types package",
	async fn() {
		const tmpDir = await Deno.makeTempDir();

		try {
			Deno.chdir(tmpDir);

			await downloadNpmPackage({
				package: "@types/three@0.148.0",
			});

			const packageJsonPath = path.resolve(tmpDir, "npm_packages/@types/three/0.148.0/three/package.json");
			const packageJsonStr = await Deno.readTextFile(packageJsonPath);
			const packageJson = JSON.parse(packageJsonStr);
			assertEquals(packageJson.name, "@types/three");
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});
