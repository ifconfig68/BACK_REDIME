// controllers/dispositivoController.js
const dispositivoService = require('../services/dispositivoService');

const createDispositivo = async (req, res) => {
  try {
    const dispositivo = await dispositivoService.createDispositivo(req.body);
    res.status(201).json(dispositivo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDispositivosByUsuario = async (req, res) => {
  try {
    const dispositivos = await dispositivoService.getDispositivosByUsuario(req.params.id_usuario);
    res.json(dispositivos);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const getDispositivo = async (req, res) => {
  try {
    const dispositivo = await dispositivoService.getDispositivo(req.params.id);
    res.json(dispositivo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { createDispositivo, getDispositivosByUsuario, getDispositivo };