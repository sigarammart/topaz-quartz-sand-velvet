#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * The auth schema under migrations/auth/ is included when VITE_AUTH_ENABLED=true.
 * This keeps the auth tables opt-in while allowing deployed apps to use the
 * Better Auth schema with an external Postgres database.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { pendingMigrations } from "./migration-plan.mjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log(
    "[migrate] DATABASE_URL not set — skipping (the PGLite fallback migrates itself).",
  );
  process.exit(0);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

function pathForMigration(name, entries) {
  const authPath = "auth/" + name;
  return entries.includes(authPath) ? authPath : name;
}

async function main() {
  let entries;
  try {
    entries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }

  // The auth schema is intentionally kept under migrations/auth/ so apps that
  // do not enable authentication do not create Better Auth tables. When auth is
  // enabled, include those SQL files in the same migration bookkeeping.
  const authEnabled = process.env.VITE_AUTH_ENABLED === "true";
  if (authEnabled) {
    try {
      const authEntries = await readdir(join(migrationsDir, "auth"));
      entries = [
        ...entries,
        ...authEntries
          .filter((entry) => entry.endsWith(".sql"))
          .map((entry) => "auth/" + entry),
      ];
    } catch {
      console.log("[migrate] auth migrations directory not found — continuing without auth schema.");
    }
  }
  // An app with no schema of its own must not pay for a database connection.
  if (pendingMigrations(entries, []).length === 0) {
    console.log("[migrate] no migrations — nothing to do.");
    return;
  }

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
  const client = await pool.connect();
  let migrationLockHeld = false;
  try {
    // Serialize deploys sharing the same database. Hostinger can briefly run
    // overlapping builds/restarts, and without a database-level lock two
    // migrators can both observe a migration as pending and race on _migrations.
    await client.query("SELECT pg_advisory_lock(hashtext('xplore-pondy-migrations'))");
    migrationLockHeld = true;

    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      const text = await readFile(
        join(migrationsDir, pathForMigration(name, entries)),
        "utf8",
      );
      try {
        await client.query("BEGIN");
        // pg's simple-query protocol runs a whole multi-statement file at once.
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    if (migrationLockHeld) {
      try {
        await client.query("SELECT pg_advisory_unlock(hashtext('xplore-pondy-migrations'))");
      } catch {
        // The connection is already being released; nothing else to do.
      }
    }
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  // pg errors carry the context needed to debug a bad SQL file.
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
