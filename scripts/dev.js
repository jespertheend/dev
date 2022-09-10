/**
 * @fileoverview Generates types that are required for deno task check to pass.
 */

import { generateTypes } from "https://raw.githubusercontent.com/jespertheend/deno-tsc-helper/f91c4cd1c399b1012fef9389fdba60e52f8ea41b/mod.js";
import { setCwd } from "https://deno.land/x/chdir_anywhere@v0.0.2/mod.js";
setCwd();
Deno.chdir("..");
await generateTypes();
