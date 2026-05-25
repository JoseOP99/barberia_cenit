import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const sql = `
      ALTER TABLE public.services ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 1;
      UPDATE public.services SET max_capacity = 1 WHERE max_capacity IS NULL;
    `;

    await client.query(sql);
    console.log('Migración completada exitosamente. Se añadió max_capacity.');
  } catch (err) {
    console.error('Error ejecutando migración:', err);
  } finally {
    await client.end();
  }
}

runMigration();
