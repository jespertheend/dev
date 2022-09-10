/**
 * Performs an `lstat` on `path` and returns true if the path is a file.
 * Returns false if the operation throws an error for any reason.
 *
 * Keep in mind that this can cause [TOCTOU issues](https://en.wikipedia.org/wiki/Time-of-check_to_time-of-use).
 * If your goal is to run a heavy operation when a file doesn't exist, this should
 * probably be fine to use. But for other more involved cases you'll most likely
 * want to just read/write the file and then handle errors accordingly.
 * @param {string} path
 */
export async function isFile(path) {
	try {
		const stat = await Deno.stat(path);
		return stat.isFile;
	} catch {
		return false;
	}
}
