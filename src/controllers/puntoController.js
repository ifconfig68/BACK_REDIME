// controllers/puntoController.js
const puntoService = require('../services/puntoService');

const getPuntos = async (req, res) => {
  try {
    const puntos = await puntoService.getPuntos();
    res.json(puntos);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getPunto = async (req, res) => {
  try {
    const punto = await puntoService.getPunto(req.params.id);
    res.json(punto);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { getPuntos, getPunto };