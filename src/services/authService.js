// services/authService.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (userData) => {
  const hashed = await bcrypt.hash(userData.password, 10);
  return await userModel.createUser({ ...userData, password: hashed });
};

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);

  if (!user) throw new Error('Usuario no existe');

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id_usuario },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );

  return { token, user: { id: user.id_usuario, email: user.correo } };
};

module.exports = { register, login };