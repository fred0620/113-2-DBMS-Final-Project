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
  if (!keyword) {
    return res.status(400).json({ error: '請提供 keyword 參數' });
  }

  try {
    const [rows] = await db.query(
      `SELECT User.Personal_ID, User.User_Name
FROM User
JOIN Administrator ON User.Personal_ID = Administrator.Personal_ID
JOIN Team ON Administrator.Team_ID = Team.Team_ID
WHERE User.User_Name LIKE ? OR Team.Team_Name LIKE ?
`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    res.json({ status: 'success', data: rows });
  } catch (err) {
    console.error('[SEARCH_USER_ERROR]', err);
    res.status(500).json({ status: 'error', message: '伺服器錯誤', detail: err.message });
  }
};

  

module.exports = {userregister,searchUserskeyword};


