const fs = require("fs");
const { Client } = require("pg");

function loadEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

async function main() {
  const env = loadEnv();
  const databaseUrl = new URL(env.SUPABASE_DB_URL);
  const sql = fs.readFileSync("supabase/migrations/004_add_club_member_roles.sql", "utf8");
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST_OVERRIDE || databaseUrl.hostname,
    port: Number(databaseUrl.port || 5432),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database: databaseUrl.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(sql);

  const roleColumn = await client.query(
    "select column_name from information_schema.columns where table_schema=$1 and table_name=$2 and column_name=$3",
    ["public", "club_members", "role"],
  );
  const hostFunction = await client.query("select to_regprocedure($1) as fn", ["public.user_is_host_of_club(uuid)"]);

  await client.end();

  if (roleColumn.rowCount !== 1 || !hostFunction.rows[0]?.fn) {
    throw new Error("Migration verification failed");
  }

  console.log("MIGRATION_APPLIED");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
