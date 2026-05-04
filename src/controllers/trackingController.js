// controllers/trackingController.js
const trackingService = require('../services/trackingService');

const createTracking = async (req, res) => {
  try {
    const tracking = await trackingService.createTracking(req.body);
    res.status(201).json(tracking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getTrackingByDispositivo = async (req, res) => {
  try {
    const tracking = await trackingService.getTrackingByDispositivo(req.params.id_dispositivo);
    res.json(tracking);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = { createTracking, getTrackingByDispositivo };