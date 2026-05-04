// models/trackingModel.js
const { pool } = require('../config/db');

const createTracking = async (data) => {
  const result = await pool.query(
    `INSERT INTO tracking_estado 
    (id_dispositivo, etapa, subestado, mensaje_usuario, procesamiento_tipo)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [
      data.id_dispositivo,
      data.etapa,
      data.subestado || null,
      data.mensaje_usuario || null,
      data.procesamiento_tipo
    ]
  );
  return result.rows[0];
};

const findByDispositivo = async (id_dispositivo) => {
  const result = await pool.query(
    'SELECT * FROM tracking_estado WHERE id_dispositivo = $1 ORDER BY fecha_actualizacion DESC',
    [id_dispositivo]
  );
  return result.rows;
};

module.exports = { createTracking, findByDispositivo };