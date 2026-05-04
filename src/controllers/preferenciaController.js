// controllers/preferenciaController.js
const preferenciaService = require('../services/preferenciaService');

const createPreferencia = async (req, res) => {
  try {
    const preferencia = await preferenciaService.createPreferencia(req.body);
    res.status(201).json(preferencia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePreferencia = async (req, res) => {
  try {
    const preferencia = await preferenciaService.updatePreferencia(req.params.id_usuario, req.body);
    res.json(preferencia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createPreferencia, updatePreferencia };