// services/userService.js
const userModel = require('../models/userModel');

const getUser = async (id) => {
  const user = await userModel.findById(id);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

const updateUser = async (id, data) => {
  const user = await userModel.updateUser(id, data);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

module.exports = { getUser, updateUser };