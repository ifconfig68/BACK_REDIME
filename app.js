// app.js
const express = require('express'); 
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const dispositivoRoutes = require('./src/routes/dispositivoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/dispositivos', dispositivoRoutes);

module.exports = app;