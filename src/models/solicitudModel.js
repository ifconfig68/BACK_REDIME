// models/solicitudModel.js
const { pool } = require('../config/db');

const createSolicitud = async (data) => {
  const result = await pool.query(
    `INSERT INTO solicitud_recogida 
    (id_usuario, id_dispositivo, id_punto, metodo_entrega, direccion, fecha_preferida)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      data.id_usuario,
      data.id_dispositivo,
      data.id_punto || null,
      data.metodo_entrega,
      data.direccion || null,
      data.fecha_preferida || null
    ]
  );
  return result.rows[0];
};

const findByUsuario = async (id_usuario) => {
  const result = await pool.query(
    'SELECT * FROM solicitud_recogida WHERE id_usuario = $1 ORDER BY fecha_solicitud DESC',
    [id_usuario]
  );
  return result.rows;
};

const updateEstado = async (id, estado) => {
  const result = await pool.query(
    `UPDATE solicitud_recogida SET estado_solicitud = $1 
    WHERE id_solicitud = $2 RETURNING *`,
    [estado, id]
  );
  return result.rows[0];
};

module.exports = { createSolicitud, findByUsuario, updateEstado };