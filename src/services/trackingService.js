// services/trackingService.js
const trackingModel = require('../models/trackingModel');

const createTracking = async (data) => {
  return await trackingModel.createTracking(data);
};

const getTrackingByDispositivo = async (id_dispositivo) => {
  const tracking = await trackingModel.findByDispositivo(id_dispositivo);
  if (!tracking.length) throw new Error('No se encontró tracking para este dispositivo');
  return tracking;
};

module.exports = { createTracking, getTrackingByDispositivo };