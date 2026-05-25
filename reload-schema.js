import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function reloadSchema() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('Caché del esquema recargada exitosamente.');
  } catch (err) {
    console.error('Error recargando caché:', err);
  } finally {
    await client.end();
  }
}

reloadSchema();
