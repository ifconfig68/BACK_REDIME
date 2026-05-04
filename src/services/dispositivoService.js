// services/dispositivoService.js
const dispositivoModel = require('../models/dispositivoModel');

const createDispositivo = async (data) => {
  return await dispositivoModel.createDispositivo(data);
};

const getDispositivosByUsuario = async (id_usuario) => {
  const dispositivos = await dispositivoModel.findByUsuario(id_usuario);
  if (!dispositivos.length) throw new Error('No se encontraron dispositivos');
  return dispositivos;
};

const getDispositivo = async (id) => {
  const dispositivo = await dispositivoModel.findById(id);
  if (!dispositivo) throw new Error('Dispositivo no encontrado');
  return dispositivo;
};

module.exports = { createDispositivo, getDispositivosByUsuario, getDispositivo };