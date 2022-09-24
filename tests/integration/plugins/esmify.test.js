import { dev } from "../../../mod.js";
import { assert } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.155.0/path/mod.ts";

Deno.test({
	name: "Download package and esmify",
	async fn() {
		const tmpDir = await Deno.makeTempDir();

		try {
			Deno.chdir(tmpDir);

			const npmPackagePath = path.resolve(tmpDir, "npm_package");
			const outputPath = path.resolve(tmpDir, "output.js");

			await dev({
				actions: [
					{
						type: "downloadNpmPackage",
						package: "rollup-plugin-resolve-url-objects@0.0.4",
						destination: npmPackagePath,
						downloadDependencies: true,
					},
					{
						type: "esmify",
						entryPointPath: path.resolve(npmPackagePath, "main.js"),
						outputPath,
					},
				],
			});

			const output = await Deno.readTextFile(outputPath);
			assert(output.startsWith("// @ts-nocheck\n"));
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});
