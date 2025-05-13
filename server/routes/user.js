const express = require('express');
const router = express.Router();
/*
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM User'); // 確保資料表是 User，注意大小寫
    res.json(rows);
  } catch (err) {
    console.error('資料庫查詢錯誤：', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
*/
const auth    = require('../controllers/login');
router.post("/login", auth.login);


module.exports = router;
