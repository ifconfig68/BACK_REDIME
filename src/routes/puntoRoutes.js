// routes/puntoRoutes.js
const express = require('express');
const router = express.Router();
const puntoController = require('../controllers/puntoController');

router.get('/', puntoController.getPuntos);
router.get('/:id', puntoController.getPunto);

module.exports = router;