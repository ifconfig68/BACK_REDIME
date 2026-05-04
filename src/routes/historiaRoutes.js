// routes/historiaRoutes.js
const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');

router.get('/', historiaController.getHistorias);
router.get('/:id', historiaController.getHistoria);
router.put('/:id/aprobar', historiaController.updateAprobacion);

module.exports = router;