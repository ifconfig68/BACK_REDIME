// services/puntoService.js
const puntoModel = require('../models/puntoModel');

const getPuntos = async () => {
  const puntos = await puntoModel.findAll();
  if (!puntos.length) throw new Error('No se encontraron puntos de recolección');
  return puntos;
};

const getPunto = async (id) => {
  const punto = await puntoModel.findById(id);
  if (!punto) throw new Error('Punto de recolección no encontrado');
  return punto;
};

module.exports = { getPuntos, getPunto };