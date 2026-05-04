// routes/solicitudRoutes.js
const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

router.post('/', solicitudController.createSolicitud);
router.get('/usuario/:id_usuario', solicitudController.getSolicitudesByUsuario);
router.put('/:id/estado', solicitudController.updateEstado);

module.exports = router;