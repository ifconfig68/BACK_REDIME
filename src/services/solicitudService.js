// services/solicitudService.js
const solicitudModel = require('../models/solicitudModel');

const createSolicitud = async (data) => {
  return await solicitudModel.createSolicitud(data);
};

const getSolicitudesByUsuario = async (id_usuario) => {
  const solicitudes = await solicitudModel.findByUsuario(id_usuario);
  if (!solicitudes.length) throw new Error('No se encontraron solicitudes');
  return solicitudes;
};

const updateEstado = async (id, estado) => {
  const solicitud = await solicitudModel.updateEstado(id, estado);
  if (!solicitud) throw new Error('Solicitud no encontrada');
  return solicitud;
};

module.exports = { createSolicitud, getSolicitudesByUsuario, updateEstado };