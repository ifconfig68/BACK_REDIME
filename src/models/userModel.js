// models/userModel.js
const {pool} = require('../config/db');

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const createUser = async (user) => {
  const result = await pool.query(
     `INSERT INTO users 
    (email, password, nombre, apellido, cedula, celular, fecha_creacion)
    VALUES ($1,$2,$3,$4,$5,$6,NOW())
    RETURNING id, email, nombre, apellido`,
    [
      user.email,
      user.password,
      user.nombre,
      user.apellido,
      user.cedula,
      user.celular
    ]
  );
  return result.rows[0];
};

module.exports = { findByEmail, createUser };