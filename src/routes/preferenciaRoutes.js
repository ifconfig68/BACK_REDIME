// routes/preferenciaRoutes.js
const express = require('express');
const router = express.Router();
const preferenciaController = require('../controllers/preferenciaController');

router.post('/', preferenciaController.createPreferencia);
router.put('/:id_usuario', preferenciaController.updatePreferencia);

module.exports = router;