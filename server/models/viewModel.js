const db=require('../config/db')

// 取得最新一筆 View_ID
const getLatestViewId = async () => {
    const [rows] = await db.execute(
      'SELECT View_ID FROM VIEW ORDER BY View_ID DESC LIMIT 1'
    );
    if (rows.length === 0) return "V000000001";

    const num = parseInt(rows[0].View_ID.slice(1)) + 1;
    return "V" + num.toString().padStart(9, "0");
  };
  
// 新增一筆 VIEW 紀錄
const insertViewRecord = async (viewId, sopId, personalId) => {
    await db.execute(
      'INSERT INTO VIEW (View_ID, SOP_ID, Personal_ID) VALUES (?, ?, ?)',
      [viewId, sopId, personalId]
    );
  };

// 計算SOP總瀏覽數
const Viewers_NUM = async (sopId) => {
    const [rows] = await db.execute(
      'SELECT COUNT(View_ID) AS V_NUM FROM VIEW WHERE SOP_ID=?',
      [sopId]
    );
    return rows[0].V_NUM;
  };

  module.exports = { getLatestViewId, insertViewRecord, Viewers_NUM }
