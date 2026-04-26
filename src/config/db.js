const pkg = require('pg');
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Conectado a PostgreSQL con éxito');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
  }
};

module.exports = {
  pool,
  connectDB
};