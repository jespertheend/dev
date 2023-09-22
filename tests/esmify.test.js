import { assert } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import * as path from "https://deno.land/std@0.202.0/path/mod.ts";
import { downloadNpmPackage, esmify } from "../mod.js";

Deno.test({
	name: "Download package and esmify",
	async fn() {
		const tmpDir = await Deno.makeTempDir();

		try {
			Deno.chdir(tmpDir);

			const npmPackagePath = path.resolve(tmpDir, "npm_package");
			const outFile = path.resolve(tmpDir, "output.js");

			await downloadNpmPackage({
				package: "rollup-plugin-resolve-url-objects@0.0.4",
				destination: npmPackagePath,
				downloadDependencies: true,
			});
			await esmify({
				entryPointPath: path.resolve(npmPackagePath, "main.js"),
				outFile,
			});

			const output = await Deno.readTextFile(outFile);
			assert(output.startsWith("// @ts-nocheck\n"));
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});
