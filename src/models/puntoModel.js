// models/puntoModel.js
const { pool } = require('../config/db');

const findAll = async () => {
  const result = await pool.query(
    'SELECT * FROM punto_recoleccion WHERE activo = true ORDER BY nombre ASC'
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM punto_recoleccion WHERE id_punto = $1',
    [id]
  );
  return result.rows[0];
};

module.exports = { findAll, findById };