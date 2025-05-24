const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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