/**
 * @fileoverview Generates types that are required for deno task check to pass.
 */

import { generateTypes } from "https://deno.land/x/deno_tsc_helper@v0.2.1/mod.js";
import { setCwd } from "https://deno.land/x/chdir_anywhere@v0.0.2/mod.js";
setCwd();
Deno.chdir("..");
await generateTypes();
