// models/historiaModel.js
const { pool } = require('../config/db');

const findAll = async () => {
  const result = await pool.query(
    `SELECT * FROM historia_dispositivo 
     WHERE publica = true AND estado_aprobacion = 'aprobada'
     ORDER BY fecha_generacion DESC`
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM historia_dispositivo WHERE id_historia = $1',
    [id]
  );
  return result.rows[0];
};

const updateAprobacion = async (id, estado) => {
  const result = await pool.query(
    `UPDATE historia_dispositivo SET estado_aprobacion = $1 
     WHERE id_historia = $2 RETURNING *`,
    [estado, id]
  );
  return result.rows[0];
};

module.exports = { findAll, findById, updateAprobacion };