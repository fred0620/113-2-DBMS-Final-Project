const db = require('../config/db');


const { Register, Checkmail } = require('../models/userModel');


const userregister = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // 基本欄位驗證
        if (!email || !username || !password) {
            return res.status(400).json({ error: '請填寫所有欄位' });
        }

        // 檢查 Email 是否已存在
        const existing = await Checkmail(email);
        if (existing.length > 0) {
            return res.status(409).json({ error: '此 Email 已被註冊' });
        }

        // 註冊
        const result = await Register(email, username, password);

        return res.status(200).json({
            message: '註冊成功',
            user:{
                id: result.userId,
                email: email,
                username: username
            } 
        });

    } catch (err) {
        console.error('Register Controller Error:', err);
        return res.status(500).json({ error: '伺服器錯誤，請稍後再試' });
    }
};

const searchUserskeyword = async (req, res) => {
  const keyword = req.query.keyword?.trim();

  try {
    let query = `
      SELECT U.Personal_ID, U.User_Name, A.Administrator_ID, U.Email, A.Ex_number, T.Team_Name, D.Department_Name
      FROM User U
      JOIN Administrator A ON U.Personal_ID = A.Personal_ID
      JOIN Team T ON A.Team_ID = T.Team_ID
      JOIN Department D ON T.Department_ID = D.Department_ID
    `;
    let params = [];

    // 如果有 keyword 才加條件
    if (keyword) {
      query += ` WHERE U.User_Name LIKE ? OR T.Team_Name LIKE ? OR D.Department_Name LIKE ?`;
      params = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];
    }

    const [rows] = await db.query(query, params);
    res.json({ status: 'success', data: rows });
  } catch (err) {
    console.error('[SEARCH_USER_ERROR]', err);
    res.status(500).json({ status: 'error', message: '伺服器錯誤', detail: err.message });
  }
};


  

module.exports = {userregister,searchUserskeyword};


