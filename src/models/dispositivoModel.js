// models/dispositivoModel.js
const { pool } = require('../config/db');

const createDispositivo = async (data) => {
  const result = await pool.query(
    `INSERT INTO dispositivo 
    (id_usuario, marca, modelo, ano_aproximado, tipo_dispositivo, 
     peso_estimado, antiguedad, funciona, pieza_entera, foto_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      data.id_usuario,
      data.marca,
      data.modelo,
      data.ano_aproximado,
      data.tipo_dispositivo,
      data.peso_estimado,
      data.antiguedad,
      data.funciona,
      data.pieza_entera,
      data.foto_url
    ]
  );
  return result.rows[0];
};

const findByUsuario = async (id_usuario) => {
  const result = await pool.query(
    'SELECT * FROM dispositivo WHERE id_usuario = $1 ORDER BY fecha_registro DESC',
    [id_usuario]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM dispositivo WHERE id_dispositivo = $1',
    [id]
  );
  return result.rows[0];
};

module.exports = { createDispositivo, findByUsuario, findById };