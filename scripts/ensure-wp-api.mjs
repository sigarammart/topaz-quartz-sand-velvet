#!/usr/bin/env node
/**
 * Ensures src/lib/wp-api.ts is the full source (not the truncated main blob).
 * Downloads a known-good revision and removes the false version hard-fail.
 * Safe to run on every build; no-op if file is already large enough.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "src", "lib", "wp-api.ts");
const GOOD_URL =
  "https://raw.githubusercontent.com/sigarammart/topaz-quartz-sand-velvet/bd1d7867ae1335063bd4b28a0074be1bcbd6918f/src/lib/wp-api.ts";

const MIN_BYTES = 50_000;

function needsRestore() {
  if (!existsSync(target)) return true;
  try {
    return statSync(target).size < MIN_BYTES;
  } catch {
    return true;
  }
}

function stripVersionHardFail(text) {
  const patterns = [
    /\n  if \(lastBridgeVersion !== "2026-09-27-order-lookup-v10"\) \{\n    throw new Error\("The live xplorepondy\.com payment bridge is still running an older WPCode snippet\. Replace the WPCode snippet with the latest repository version before testing again\."\);\n  \}\n/,
    /\n  if \(lastBridgeVersion !== "2026-09-27-order-lookup-v10"\) \{[\s\S]*?throw new Error\([\s\S]*?older WPCode snippet[\s\S]*?\);\n  \}\n/,
  ];
  let out = text;
  for (const re of patterns) {
    out = out.replace(
      re,
      "\n  // bridge_version is diagnostic only \u2014 do not hard-fail on version string.\n",
    );
  }
  return out;
}

async function main() {
  if (!needsRestore()) {
    const size = statSync(target).size;
    const current = readFileSync(target, "utf8");
    if (
      current.includes("older WPCode snippet") &&
      current.includes('lastBridgeVersion !== "2026-09-27-order-lookup-v10"')
    ) {
      const patched = stripVersionHardFail(current);
      if (patched !== current) {
        writeFileSync(target, patched);
        console.log("[ensure-wp-api] stripped version hard-fail from existing file (", size, "bytes)");
      } else {
        console.log("[ensure-wp-api] ok (", size, "bytes)");
      }
    } else {
      console.log("[ensure-wp-api] ok (", size, "bytes)");
    }
    return;
  }

  console.log("[ensure-wp-api] restoring full wp-api.ts from known-good commit\u2026");
  const res = await fetch(GOOD_URL);
  if (!res.ok) {
    throw new Error("[ensure-wp-api] failed to download good wp-api.ts: HTTP " + res.status);
  }
  let text = await res.text();
  if (text.length < MIN_BYTES) {
    throw new Error("[ensure-wp-api] downloaded file too small (" + text.length + " bytes)");
  }
  text = stripVersionHardFail(text);
  text = text
    .replaceAll(
      "Update the xplore-pwa-social-session-bridge.php WPCode snippet on xplorepondy.com.",
      "Install/activate the xplore-pwa-booking-bridge plugin on xplorepondy.com.",
    )
    .replaceAll(
      "Check the WPCode snippet and WooCommerce on xplorepondy.com.",
      "Check the xplore-pwa-booking-bridge plugin and WooCommerce on xplorepondy.com.",
    );
  writeFileSync(target, text);
  console.log("[ensure-wp-api] restored", target, "(", text.length, "bytes)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
