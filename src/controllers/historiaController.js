// controllers/historiaController.js
const historiaService = require('../services/historiaService');

const getHistorias = async (req, res) => {
  try {
    const historias = await historiaService.getHistorias();
    res.json(historias);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getHistoria = async (req, res) => {
  try {
    const historia = await historiaService.getHistoria(req.params.id);
    res.json(historia);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateAprobacion = async (req, res) => {
  try {
    const historia = await historiaService.updateAprobacion(req.params.id, req.body.estado);
    res.json(historia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getHistorias, getHistoria, updateAprobacion };