const { Client } = require("pg");
require("dotenv").config();

async function resetDb() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Resetting database tables for MOsQuE schema...");
  try {
    await client.query("DROP SCHEMA public CASCADE;");
    await client.query("CREATE SCHEMA public;");
    await client.query("GRANT ALL ON SCHEMA public TO public;");
    console.log("✓ Public schema reset successfully.");
  } catch (err) {
    console.error("Error resetting schema:", err);
  } finally {
    await client.end();
  }
}

resetDb();
