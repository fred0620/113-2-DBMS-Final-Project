const db = require('../config/db');

// 產生 U+9 位數 ID
const generateUserId = () => {
    const randomNum = Math.floor(100000000 + Math.random() * 900000000); // 保證是 9 位數
    return `U${randomNum}`;
};

// 檢查 User_ID 是否已存在
const checkUserIdExists = async (userId) => {
    const [rows] = await db.execute(`SELECT Personal_ID FROM User WHERE Personal_ID = ?`, [userId]);
    return rows.length > 0;
};

// 主註冊函式
const Register = async (email, username, password) => {
    let userId;
    let exists = true;

    // 不斷嘗試生成直到沒有重複
    while (exists) {
        userId = generateUserId();
        exists = await checkUserIdExists(userId);
    }

    // 寫入資料
    const [result] = await db.execute(
        `INSERT INTO User (Personal_ID, User_Name, Email, Password)
         VALUES (?, ?, ?, ?)`,
        [userId, username, email, password]
    );

    return { insertResult: result, userId };
};

const Checkmail = async (email) => {
    const [result] = await db.execute(
        `SELECT Email FROM User WHERE Email = ?`,
        [email]
    );
    return result;
};

module.exports = { Register, Checkmail };
