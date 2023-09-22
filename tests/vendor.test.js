import { vendor } from "../src/vendor.js";
import { exists } from "https://deno.land/std@0.202.0/fs/mod.ts";
import { resolve } from "https://deno.land/std@0.202.0/path/mod.ts";
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";

Deno.test({
	name: "vendor two entry points",
	async fn() {
		const tmpDir = await Deno.makeTempDir();
		const entryPoints = [
			"https://deno.land/x/renda@v0.1.0/src/mod.js",
			"https://deno.land/x/adlad@v0.10.0/mod.js",
		];

		try {
			await vendor({
				entryPoints,
				outDir: tmpDir,
			});

			const denoLandExists = await exists(resolve(tmpDir, "deno.land"), { isDirectory: true });
			assertEquals(denoLandExists, true);
			const rendaExists = await exists(resolve(tmpDir, "deno.land", "x", "renda@v0.1.0", "src", "mod.js"), {
				isFile: true,
			});
			assertEquals(rendaExists, true);
			const adladPath = resolve(tmpDir, "deno.land", "x", "adlad@v0.10.0", "mod.js");
			const adladExists = await exists(adladPath, { isFile: true });
			assertEquals(adladExists, true);

			// Change one of the files so that we can check it's not fetched again
			await Deno.writeTextFile(adladPath, "changed");

			await vendor({
				entryPoints,
				outDir: tmpDir,
			});

			const contents1 = await Deno.readTextFile(adladPath);
			assertEquals(contents1, "changed");

			// Vendoring with force should overwrite it

			await vendor({
				entryPoints,
				outDir: tmpDir,
				force: true,
			});

			const contents2 = await Deno.readTextFile(adladPath);
			assertNotEquals(contents2, "changed");
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
		}
	},
});
