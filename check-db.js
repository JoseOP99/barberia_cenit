import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkDb() {
  try {
    await client.connect();
    
    // Get all tables in public schema
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    
    console.log("Database Tables and Row Counts:");
    console.log("-------------------------------");
    
    for (const table of tables) {
      const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      const count = countResult.rows[0].count;
      console.log(`${table}: ${count} rows`);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkDb();
