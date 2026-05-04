// controllers/solicitudController.js
const solicitudService = require('../services/solicitudService');

const createSolicitud = async (req, res) => {
  try {
    const solicitud = await solicitudService.createSolicitud(req.body);
    res.status(201).json(solicitud);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSolicitudesByUsuario = async (req, res) => {
  try {
    const solicitudes = await solicitudService.getSolicitudesByUsuario(req.params.id_usuario);
    res.json(solicitudes);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateEstado = async (req, res) => {
  try {
    const solicitud = await solicitudService.updateEstado(req.params.id, req.body.estado);
    res.json(solicitud);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createSolicitud, getSolicitudesByUsuario, updateEstado };