#!/usr/bin/env node
/**
 * Restores src/lib/wp-api.ts from the embedded gzip+base64 payload.
 * Run: node scripts/restore-wp-api.mjs
 * Then commit the restored src/lib/wp-api.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b64Path = join(root, "scripts", "wp-api.restore.b64");
const outPath = join(root, "src", "lib", "wp-api.ts");
const b64 = readFileSync(b64Path, "utf8").replace(/\s+/g, "");
const buf = gunzipSync(Buffer.from(b64, "base64"));
writeFileSync(outPath, buf);
console.log("Restored", outPath, "(", buf.length, "bytes)");
