const {pool} = require('./db'); // asegúrate de tener configurado pg Pool

const initContactTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tabla 'contactos' lista");
  } catch (err) {
    console.error("Error creando tabla 'contactos':", err);
  }
};

module.exports = {
  initContactTable
};