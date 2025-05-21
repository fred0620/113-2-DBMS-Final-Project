const db=require('../config/db')
const sopModel = require('../models/sopsModel');

async function handleSopStatusUpdate(sopId, incomingStatus, editor, editor_ID) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const sop = await sopModel.getSopForUpdate(conn, sopId);
    if (!sop) {
      await conn.rollback();
      return { status: 'error', message: 'SOP not found' };
    }

    const { status: currentStatus, edit_name: currentEditor, editor_id: currentEditorID } = sop;

    if (incomingStatus === 'timeout') {
      await sopModel.updateSopStatus(conn, sopId, 'finish', null,null);
      await conn.commit();
      return { status: 'success', message: 'timeout -> finish' };
    }

    if (incomingStatus === 'finish') {
      if (currentStatus === 'finish') {
        await conn.commit();
        return { status: 'noop', message: 'already finished' };
      }
      if (currentStatus === 'updating') {
        if (currentEditor === editor) {
          await sopModel.updateSopStatus(conn, sopId, 'finish', null,null);
          await conn.commit();
          return { status: 'success', message: 'editor matched, set to finish' };
        } else {
          await conn.rollback();
          return { status: 'reject', message: `SOP 正在被 ${currentEditor} 編輯` };
        }
      }
    }

    if (incomingStatus === 'updating') {
      if (currentStatus === 'finish') {
        await sopModel.updateSopStatus(conn, sopId, 'updating', editor,editor_ID);
        await conn.commit();
        return { status: 'success', message: 'locked for editing' };
      }
      if (currentStatus === 'updating') {
        await conn.rollback();
        return { status: 'reject', message: `SOP 正在被 ${currentEditor} 編輯` };
      }
    }

    await conn.rollback();
    return { status: 'error', message: 'Unhandled status transition' };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { status: 'error', message: 'Internal server error' };
  } finally {
    conn.release();
  }
}

module.exports = {
  handleSopStatusUpdate
};
