import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function checkSchema() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'monthly_raffles';
    `);
    console.log("monthly_raffles columns:", result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
checkSchema();
