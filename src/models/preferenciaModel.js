// models/preferenciaModel.js
const { pool } = require('../config/db');

const createPreferencia = async (data) => {
  const result = await pool.query(
    `INSERT INTO preferencia_usuario 
    (id_usuario, tipo_procesamiento_preferido, consentimiento_publicacion)
    VALUES ($1,$2,$3)
    RETURNING *`,
    [
      data.id_usuario,
      data.tipo_procesamiento_preferido || null,
      data.consentimiento_publicacion || false
    ]
  );
  return result.rows[0];
};

const updatePreferencia = async (id_usuario, data) => {
  const result = await pool.query(
    `UPDATE preferencia_usuario SET 
      tipo_procesamiento_preferido = $1,
      consentimiento_publicacion = $2
     WHERE id_usuario = $3
     RETURNING *`,
    [
      data.tipo_procesamiento_preferido || null,
      data.consentimiento_publicacion,
      id_usuario
    ]
  );
  return result.rows[0];
};

module.exports = { createPreferencia, updatePreferencia };