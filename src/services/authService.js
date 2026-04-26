// services/authService.js
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (userData) => {
  const hashed = await bcrypt.hash(userData.password, 10);
  return await userModel.createUser({ ...userData, password: hashed } );
};

const login = async (email, password) => {
  const user = await userModel.findByEmail(email);

  if (!user) throw new Error('Usuario no existe');

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, user: { id: user.id, email: user.email } };
};

module.exports = { register, login };