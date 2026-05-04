// services/historiaService.js
const historiaModel = require('../models/historiaModel');

const getHistorias = async () => {
  const historias = await historiaModel.findAll();
  if (!historias.length) throw new Error('No se encontraron historias públicas');
  return historias;
};

const getHistoria = async (id) => {
  const historia = await historiaModel.findById(id);
  if (!historia) throw new Error('Historia no encontrada');
  return historia;
};

const updateAprobacion = async (id, estado) => {
  const historia = await historiaModel.updateAprobacion(id, estado);
  if (!historia) throw new Error('Historia no encontrada');
  return historia;
};

module.exports = { getHistorias, getHistoria, updateAprobacion };