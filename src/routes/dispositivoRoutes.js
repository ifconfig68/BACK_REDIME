// routes/dispositivoRoutes.js
const express = require('express');
const router = express.Router();
const dispositivoController = require('../controllers/dispositivoController');

router.post('/', dispositivoController.createDispositivo);
router.get('/usuario/:id_usuario', dispositivoController.getDispositivosByUsuario);
router.get('/:id', dispositivoController.getDispositivo);

module.exports = router;