import * as fs from "https://deno.land/std@0.155.0/fs/mod.ts";

/**
 * @param {string} filePath
 */
async function addTsNocheckToFile(filePath) {
	let content = await Deno.readTextFile(filePath);
	if (content.split("\n").find((line) => line.startsWith("// @ts-nocheck"))) return;
	content = "// @ts-nocheck\n\n" + content;
	await Deno.writeTextFile(filePath, content);
}

/**
 * Adds '@ ts-nocheck' comments to the top of each .ts/.js file in a directory.
 * This is useful if you want to exclude an entire directory from type checking.
 * You'll generally only want to run this on third party code, since you don't want to typecheck that anyway.
 * This is essentially a workaround for https://github.com/microsoft/TypeScript/issues/52325
 *
 * ts-nocheck comments are added only once, if the file already contains a ts-nocheck comment, it is skipped.
 * @param {Object} options
 * @param {string} options.path The file or directory for which '@ts-nocheck' should be added to the files.
 * @param {boolean} [options.excludeJs] Set to true if you don't want '@ts-nocheck' to be added to .js files.
 * @param {boolean} [options.excludeTs] Set to true if you don't want '@ts-nocheck' to be added to .ts files.
 */
export async function addTsNocheck({
	path,
	excludeJs,
	excludeTs,
}) {
	for await (const entry of fs.walk(path)) {
		if (entry.isFile) {
			if (entry.name.endsWith(".ts") && !excludeTs) {
				await addTsNocheckToFile(entry.path);
			}
			if (entry.name.endsWith(".js") && !excludeJs) {
				await addTsNocheckToFile(entry.path);
			}
		}
	}
}
