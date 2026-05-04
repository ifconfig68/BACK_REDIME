// models/userModel.js
const {pool} = require('../config/db');

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM usuario WHERE correo = $1',
    [email]
  );
  return result.rows[0];
};

const createUser = async (user) => {
  const result = await pool.query(
    `INSERT INTO usuario 
    (correo, password_hash, nombre, apellido, telefono, documento_identidad, tipo_usuario, fecha_registro)
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    RETURNING id_usuario, correo, nombre, apellido`,
    [
      user.email,
      user.password,
      user.nombre,
      user.apellido,
      user.celular,
      user.cedula,
      user.tipo_usuario
    ]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT id_usuario, nombre, apellido, correo, telefono, direccion, 
     documento_identidad, tipo_usuario, fecha_registro 
     FROM usuario WHERE id_usuario = $1`,
    [id]
  );
  return result.rows[0];
};

const updateUser = async (id, data) => {
  const result = await pool.query(
    `UPDATE usuario SET 
      nombre = $1, apellido = $2, telefono = $3, direccion = $4
    WHERE id_usuario = $5
    RETURNING id_usuario, nombre, apellido, correo, telefono, direccion`,
    [data.nombre, data.apellido, data.telefono, data.direccion, id]
  );
  return result.rows[0];
};

module.exports = { findByEmail, createUser, findById, updateUser };