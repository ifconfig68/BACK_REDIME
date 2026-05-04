// services/preferenciaService.js
const preferenciaModel = require('../models/preferenciaModel');

const createPreferencia = async (data) => {
  return await preferenciaModel.createPreferencia(data);
};

const updatePreferencia = async (id_usuario, data) => {
  const preferencia = await preferenciaModel.updatePreferencia(id_usuario, data);
  if (!preferencia) throw new Error('Preferencia no encontrada');
  return preferencia;
};

module.exports = { createPreferencia, updatePreferencia };