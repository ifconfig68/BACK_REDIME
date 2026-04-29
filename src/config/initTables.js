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

const initUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        cedula VARCHAR(255) NOT NULL,
        celular VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Tabla 'user' lista");  
  } catch (err) {
    console.error("Error creando tabla 'users':", err);
  }
};



module.exports = {
  initContactTable,
  initUserTable

};