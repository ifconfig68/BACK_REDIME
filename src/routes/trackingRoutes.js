// routes/trackingRoutes.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.post('/', trackingController.createTracking);
router.get('/:id_dispositivo', trackingController.getTrackingByDispositivo);

module.exports = router;