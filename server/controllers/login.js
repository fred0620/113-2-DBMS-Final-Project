const authService = require('../services/login');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await authService.login(email, password);
    res.status(200).json(userData); // 成功登入，回傳 user 資料
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { login };
