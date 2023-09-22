import { assertEquals } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import { assertSpyCall, assertSpyCalls, stub } from "https://deno.land/std@0.202.0/testing/mock.ts";
import * as path from "https://deno.land/std@0.202.0/path/mod.ts";
import { downloadFile } from "../src/downloadFile.js";

Deno.test({
	name: "Basic file download",
	async fn() {
		const tmpDir = await Deno.makeTempDir();
		const fetchSpy = stub(globalThis, "fetch", async () => new Response("file content"));

		try {
			Deno.chdir(tmpDir);

			const url = "https://example.com/test.txt";
			const destination = "test.txt";

			await downloadFile({ url, destination });
			assertSpyCalls(fetchSpy, 1);
			assertSpyCall(fetchSpy, 0, {
				args: [url],
			});

			const filePath = path.resolve(tmpDir, destination);
			const fileText1 = await Deno.readTextFile(filePath);
			assertEquals(fileText1, "file content");

			// check if running a second time doesn't trigger the download again:

			// change the file so that we can verify it hasn't been touched
			await Deno.writeTextFile(filePath, "new content");
			await downloadFile({ url, destination });

			assertSpyCalls(fetchSpy, 1);

			const fileText2 = await Deno.readTextFile(filePath);
			assertEquals(fileText2, "new content");

			// Running with `force: true` downloads it even though it already exists
			await downloadFile({ url, destination, force: true });

			assertSpyCalls(fetchSpy, 2);

			const fileText3 = await Deno.readTextFile(filePath);
			assertEquals(fileText3, "file content");
		} finally {
			Deno.chdir(".."); // https://github.com/denoland/deno/issues/15849
			await Deno.remove(tmpDir, { recursive: true });
			fetchSpy.restore();
		}
	},
});
