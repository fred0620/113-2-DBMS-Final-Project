const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'dbms-final-project.cadio04y0g2o.us-east-1.rds.amazonaws.com',         // 或遠端伺服器的 IP
  user: 'admin',              // 替換為你的使用者名稱
  password: 'Final2025!SQL',  // 替換為你的密碼
  database: 'DBMS_Final',  // 替換為你的資料庫名稱
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

const promisePool = pool.promise();

// ⬇️ 這段是測試用的，專案初期 debug 超有用
promisePool.query('SELECT 1')
  .then(() => {
    console.log('✅ MySQL 資料庫連線成功');
  })
  .catch((err) => {
    console.error('❌ MySQL 連線失敗：', err);
  });

// getConnection 函式，取得 connection 物件，用於 transaction
const getConnection = () => {
  return pool.promise().getConnection();
};

module.exports = {
  execute: (...args) => promisePool.execute(...args),
  query: (...args) => promisePool.query(...args),
  getConnection
};