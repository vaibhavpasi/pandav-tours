#!/usr/bin/env node
/**
 * Local Supabase-compatible stack WITHOUT Docker, for development and
 * end-to-end testing:
 *
 *   PostgreSQL (your install)  ←  PostgREST  ←  proxy at /rest/v1  ←  the app
 *
 * It recreates a database, applies scripts/local-stack/supabase-stub.sql, every
 * migration and supabase/seed.sql ([TEST] data), starts PostgREST and a tiny
 * proxy that mimics Supabase's URL layout, and prints the env vars to run
 * the app against it. Supabase Auth is NOT emulated (admin login needs a
 * real Supabase project).
 *
 * Requirements:
 *   PG_BIN         folder with psql(.exe)            (PostgreSQL 15+)
 *   POSTGREST_BIN  path to the postgrest executable  (v12+; on Windows libpq.dll
 *                  must be on PATH — it ships in PG_BIN)
 *   PGPORT         port of the running PostgreSQL server (default 5432)
 *
 * Usage: node scripts/local-stack/start.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { readdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

const PG_BIN = required("PG_BIN");
const POSTGREST_BIN = required("POSTGREST_BIN");
const PGPORT = process.env.PGPORT ?? "5432";
const DB = process.env.LOCAL_DB_NAME ?? "pandav_local";
const API_PORT = Number(process.env.LOCAL_API_PORT ?? 54321);
const POSTGREST_PORT = API_PORT + 9;
const JWT_SECRET = process.env.LOCAL_JWT_SECRET ?? randomBytes(32).toString("hex");

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Set ${name} (see the header of ${path.basename(fileURLToPath(import.meta.url))}).`);
    process.exit(1);
  }
  return value;
}

function psql(database, args) {
  const exe = path.join(PG_BIN, process.platform === "win32" ? "psql.exe" : "psql");
  const result = spawnSync(exe, ["-h", "127.0.0.1", "-p", PGPORT, "-U", "postgres", "-d", database, "-v", "ON_ERROR_STOP=1", "-q", ...args], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`psql failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ iss: "pandav-local", iat: Math.floor(Date.now() / 1000), exp: 4102444800, ...payload }));
  const signature = createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

// 1. Fresh database with stub, migrations and test seed.
console.log(`Recreating database "${DB}" on port ${PGPORT}…`);
psql("postgres", ["-c", `drop database if exists ${DB} with (force)`, "-c", `create database ${DB}`]);
psql(DB, ["-f", path.join(here, "supabase-stub.sql")]);
const migrationsDir = path.join(root, "supabase", "migrations");
for (const file of readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort()) {
  psql(DB, ["-f", path.join(migrationsDir, file)]);
  console.log(`  applied ${file}`);
}
psql(DB, ["-f", path.join(root, "supabase", "seed.sql")]);
console.log("  applied seed.sql ([TEST] data)");

// 2. PostgREST.
const configPath = path.join(tmpdir(), `pandav-postgrest-${process.pid}.conf`);
writeFileSync(
  configPath,
  [
    `db-uri = "postgres://authenticator@127.0.0.1:${PGPORT}/${DB}"`,
    `db-schemas = "public"`,
    `db-anon-role = "anon"`,
    `jwt-secret = "${JWT_SECRET}"`,
    `server-host = "127.0.0.1"`,
    `server-port = ${POSTGREST_PORT}`,
    `log-level = "warn"`,
  ].join("\n"),
);
const postgrest = spawn(POSTGREST_BIN, [configPath], {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, PATH: `${PG_BIN}${path.delimiter}${process.env.PATH}` },
});
postgrest.on("exit", (code) => {
  console.error(`PostgREST exited (${code})`);
  process.exit(1);
});

// 3. Proxy that mimics https://<project>.supabase.co/rest/v1/*
const proxy = http.createServer((req, res) => {
  if (!req.url?.startsWith("/rest/v1/")) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: "Only /rest/v1 is emulated locally" }));
    return;
  }
  const upstream = http.request(
    {
      host: "127.0.0.1",
      port: POSTGREST_PORT,
      method: req.method,
      path: req.url.slice("/rest/v1".length),
      headers: { ...req.headers, host: `127.0.0.1:${POSTGREST_PORT}` },
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on("error", (error) => {
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ message: `PostgREST unavailable: ${error.message}` }));
  });
  req.pipe(upstream);
});

proxy.listen(API_PORT, "127.0.0.1", () => {
  const anonKey = signJwt({ role: "anon" });
  const serviceKey = signJwt({ role: "service_role" });
  console.log(`\nLocal API ready at http://127.0.0.1:${API_PORT}\n`);
  console.log("Run the app with these environment variables (do NOT use them anywhere else):\n");
  console.log(`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${API_PORT}`);
  console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${anonKey}`);
  console.log(`SUPABASE_SECRET_KEY=${serviceKey}`);
  console.log(`RATE_LIMIT_SALT=${randomBytes(24).toString("hex")}`);
  console.log(`BOOKING_LINK_SECRET=${randomBytes(32).toString("hex")}`);
  writeFileSync(
    path.join(tmpdir(), "pandav-local-stack.env.json"),
    JSON.stringify({
      NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anonKey,
      SUPABASE_SECRET_KEY: serviceKey,
      PGPORT,
      DB,
    }),
  );
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    postgrest.kill();
    proxy.close();
    process.exit(0);
  });
}

