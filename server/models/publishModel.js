const db=require('../config/db')

const Publish = async (sopId, publish) => {
  const [sop_publish_update] = await db.execute(`
    UPDATE SOP
    SET is_publish = ?
    WHERE SOP_ID = ?;
  `, [publish, sopId]);

  if (sop_publish_update.affectedRows > 0) {
    const [sop_publish_read_result] = await db.execute(`
      SELECT is_publish
      FROM SOP
      WHERE SOP_ID = ?;
    `, [sopId]);

    const sop_status = sop_publish_read_result[0]?.is_publish;
    return { sop_status };
  } else {
    // 更新失敗，可能 SOP_ID 不存在
    return { error: 'Publish update failed. SOP_ID not found or no change made.' };
  }
};



module.exports = { Publish };