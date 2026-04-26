const pkg = require('pg');
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log('Conectado a PostgreSQL con éxito');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
  }
};

module.exports = {
  client,
  connectDB
};