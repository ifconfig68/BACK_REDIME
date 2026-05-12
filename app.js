// app.js
const express = require('express'); 
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const dispositivoRoutes = require('./src/routes/dispositivoRoutes');
const solicitudRoutes = require('./src/routes/solicitudRoutes');
const puntoRoutes = require('./src/routes/puntoRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const historiaRoutes = require('./src/routes/historiaRoutes');
const preferenciaRoutes = require('./src/routes/preferenciaRoutes');
const { verifyToken } = require('./src/middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/puntos', puntoRoutes);
app.use('/api/historias', historiaRoutes);

// Rutas protegidas
app.use('/api/usuarios', verifyToken, userRoutes);
app.use('/api/dispositivos', verifyToken, dispositivoRoutes);
app.use('/api/solicitudes', verifyToken, solicitudRoutes);
app.use('/api/tracking', verifyToken, trackingRoutes);
app.use('/api/preferencias', verifyToken, preferenciaRoutes);

module.exports = app;