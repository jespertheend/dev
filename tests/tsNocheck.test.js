import { assertEquals } from "https://deno.land/std@0.155.0/testing/asserts.ts";
import { addTsNocheck } from "../src/tsNocheck.js";

/**
 * @param {Object} options
 * @param {(tmpDir: string) => Promise<void>} options.fn
 */
async function basicTest({ fn }) {
	const tmpDir = await Deno.makeTempDir();

	try {
		Deno.chdir(tmpDir);
		await fn(tmpDir);
	} finally {
		Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
		await Deno.remove(tmpDir, { recursive: true });
	}
}

Deno.test({
	name: "Add @ts-nocheck to directory",
	async fn() {
		await basicTest({
			async fn(tmpDir) {
				await Deno.writeTextFile("a.js", "hello");
				await Deno.writeTextFile("b.ts", "hello");
				await Deno.mkdir("dir");
				await Deno.writeTextFile("dir/c.js", "hello");
				await Deno.writeTextFile("dir/d.ts", "hello");
				await addTsNocheck({
					path: tmpDir,
				});

				const contentA = await Deno.readTextFile("a.js");
				assertEquals(contentA, "// @ts-nocheck\n\nhello");
				const contentB = await Deno.readTextFile("b.ts");
				assertEquals(contentB, "// @ts-nocheck\n\nhello");
				const contentC = await Deno.readTextFile("dir/c.js");
				assertEquals(contentC, "// @ts-nocheck\n\nhello");
				const contentD = await Deno.readTextFile("dir/d.ts");
				assertEquals(contentD, "// @ts-nocheck\n\nhello");
			},
		});
	},
});

Deno.test({
	name: "excludeJs",
	async fn() {
		await basicTest({
			async fn(tmpDir) {
				await Deno.writeTextFile("a.js", "hello");
				await Deno.writeTextFile("b.ts", "hello");
				await addTsNocheck({
					path: tmpDir,
					excludeJs: true,
				});
				const contentA = await Deno.readTextFile("a.js");
				assertEquals(contentA, "hello");
				const contentB = await Deno.readTextFile("b.ts");
				assertEquals(contentB, "// @ts-nocheck\n\nhello");
			},
		});
	},
});

Deno.test({
	name: "excludeTs",
	async fn() {
		await basicTest({
			async fn(tmpDir) {
				await Deno.writeTextFile("a.js", "hello");
				await Deno.writeTextFile("b.ts", "hello");
				await addTsNocheck({
					path: tmpDir,
					excludeTs: true,
				});
				const contentA = await Deno.readTextFile("a.js");
				assertEquals(contentA, "// @ts-nocheck\n\nhello");
				const contentB = await Deno.readTextFile("b.ts");
				assertEquals(contentB, "hello");
			},
		});
	},
});

Deno.test({
	name: "Does not add @ts-nocheck multiple times",
	async fn() {
		await basicTest({
			async fn(tmpDir) {
				await Deno.writeTextFile("fileA.js", "// @ts-nocheck");
				await Deno.writeTextFile("fileB.js", "prefix // @ts-nocheck");
				await Deno.writeTextFile("fileC.js", "prefix\n// @ts-nocheck");

				await addTsNocheck({
					path: tmpDir,
				});

				assertEquals(await Deno.readTextFile("fileA.js"), "// @ts-nocheck");
				assertEquals(await Deno.readTextFile("fileB.js"), "// @ts-nocheck\n\nprefix // @ts-nocheck");
				assertEquals(await Deno.readTextFile("fileC.js"), "prefix\n// @ts-nocheck");
			},
		});
	},
});
