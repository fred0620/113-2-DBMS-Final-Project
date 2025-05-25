const db=require('../config/db')

// 取得最新一筆 View_ID
const getLatestViewId = async () => {
    const [rows] = await db.execute(
      'SELECT View_ID FROM Views ORDER BY View_ID DESC LIMIT 1'
    );
    if (rows.length === 0) return "V000000001";

    const num = parseInt(rows[0].View_ID.slice(1)) + 1;
    return "V" + num.toString().padStart(9, "0");
  };
  
// 新增一筆 VIEW 紀錄
const insertViewRecord = async (viewId, sopId, personalId) => {
  try {
    await db.execute(
      'INSERT INTO Views (View_ID, SOP_ID, Personal_ID) VALUES (?, ?, ?)',
      [viewId, sopId, personalId]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.warn(`[InsertView] 忽略重複主鍵 ${viewId}`);
    } else {
      console.error('[InsertView] 發生錯誤：', err);
    }
  }
};


// 計算SOP總瀏覽數
const Viewers_NUM = async (sopId) => {
    const [rows] = await db.execute(
      'SELECT COUNT(View_ID) AS V_NUM FROM Views WHERE SOP_ID=?',
      [sopId]
    );
    return rows[0].V_NUM;
  };

  module.exports = { getLatestViewId, insertViewRecord, Viewers_NUM }
