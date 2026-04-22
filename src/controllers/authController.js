// controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { register, login };