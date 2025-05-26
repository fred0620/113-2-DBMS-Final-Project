//controllers/sop
const db = require('../config/db');
const sopModel = require('../models/sopsModel');
const moduleModel = require('../models/moduleModel');
const { logSOPView } = require('../services/viewService');
const { Viewers_NUM } = require('../models/viewModel');
const sopstatus = require('../services/sopstatus.js');

const getSopPage = async (req, res) => {
  const sopId = req.params.sop_id;

  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {sop,  edges, module, version} = await sopModel.getSopById(sopId);
    if (!sop) {
      return res.status(404).json({ status: 'fail', message: 'NOT FOUND SOP' });
    }

    await logSOPView(req, sopId); // 記錄瀏覽行為
    const viewCount = await Viewers_NUM(sopId); // 查瀏覽數
    
    res.json({
      status: 'success',
      data:{...sop,
      nodes:module,
      edges:edges},
      message: `You viewed SOP ${sopId}`,
      views: viewCount,
      version: version
    });
  } catch (err) {
    console.error(`[SOP_ERROR] Failed to load SOP ${sopId}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};

const searchSops = async (req, res) => {
  const page = req.query.page || 'normal';
  const keyword = req.query.keyword?.trim() || '';
  const personalId = req.query.personal_id || '';
  const team = req.query.team || '';
  const department = req.query.department || '';
  try {
    let sops;

    if (page === 'save') {
      if (!personalId) return res.status(400).json({ error: 'personal_id 必填' });
      sops = await sopModel.searchSavedSops(keyword, personalId);
    } else if (page === 'my') {
      if (!team) return res.status(400).json({ error: 'team 必填' });
      sops = await sopModel.searchMySops(keyword, team);
    } else {
      sops = await sopModel.searchPublicSops(keyword,department,team);
    }

    res.json(sops);
  } catch (err) {
    console.error('[SOP_SEARCH_ERROR]', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};


const createSOP = async (req, res, next) => {
  console.log('req.body =', req.body);
  try {
    const { SOP_Name, SOP_Content, Team_in_charge,Created_by } = req.body;
    if (!SOP_Name || !SOP_Content || !Team_in_charge|| !Created_by) {
      return res.status(400).json({ message: '缺少必要欄位' });
    }
    const [[teamRow]] = await db.query(
      'SELECT Team_ID FROM Team WHERE Team_Name = ?',
      [Team_in_charge.trim()]
    );

    if (!teamRow) {
      return res.status(400).json({ message: `Team '${Team_in_charge}' 不存在，請先建立` });
    }
    const Team_ID = teamRow.Team_ID; 
    const newSop = await sopModel.createSop({ SOP_Name, SOP_Content, Team_ID });
    await db.query(
      `INSERT INTO SOP_log (SOP_ID, Administrator_ID, Log)
       VALUES (?, ?, ?)`,
      [newSop.id, Created_by, 'create']
    );
    await db.query(
      `INSERT INTO Module (SOP_ID, Version, Type, Title, Details, Update_by)
       VALUES (?, 1, 'start', '尚未建立Module', '',  ?)`,
      [newSop.id,Created_by]
    );

    
    
    res.status(201).json({
      message: 'SOP created successfully',
      sop: {
        id: newSop.id,
        SOP_Name,
        SOP_Content,
        Team_in_charge       
      }
    });
  } catch (err) {
    next(err);
  }
};

const getModule = async (req, res) => {
  const module_id = req.params.module_id;

  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {module, form} = await moduleModel.getModuleById(module_id);
    if (!module) {
      return res.status(404).json({ status: 'fail', message: 'NOT FOUND MODULE' });
    }
    
    res.json({
      Module_ID: module.Module_ID,
      Type: module.type,
      Title: module.Title,
      Details: module.Details,
      User_Name: module.User_Name,
      Department: module.Department,
      Team: module.Team,
      Ex_number: module.Ex_number,
      Email:module.Email,
      form_links: form.map(f => ({ Link: f.Link, Link_Name: f.Link_Name }))
    });
  } catch (err) {
    console.error(`[SOP_ERROR] Failed to load Module ${module_id}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};

const updateSopinfo = async (req, res, next) => {
  const urlSopId = req.params.sop_id;
  const { SOP_ID, SOP_Name, SOP_Content, Team_in_charge, Updated_by } = req.body;


  try {

    if (!SOP_ID || SOP_ID !== urlSopId) {
      return res.status(400).json({ message: 'SOP_ID 與 URL 不一致' });
    }
    if (!SOP_Name || !Team_in_charge || !Updated_by) {
      return res.status(400).json({ message: '缺少必要欄位' });
    }


    const [[teamRow]] = await db.query(
      'SELECT 1 FROM Team WHERE Team_ID = ?',
      [Team_in_charge.trim()]
    );
    if (!teamRow) {
      return res.status(400).json({ message: `Team_ID '${Team_in_charge}' 不存在` });
    }


    const [[adminRow]] = await db.query(
      'SELECT 1 FROM Administrator WHERE Administrator_ID = ?',
      [Updated_by.trim()]
    );
    if (!adminRow) {
      return res.status(400).json({ message: `Administrator_ID '${Updated_by}' 不存在` });
    }

   
    const updated = await sopModel.updateSopinfo({
      SOP_ID,
      SOP_Name,
      SOP_Content,
      Team_ID: Team_in_charge.trim(),   
      Updated_by,
      logText: "Update SOP Info"
    });

  
    res.json({
      message: 'SOP updated successfully',
      sop: {
        id: updated.id,
        SOP_Name: updated.SOP_Name,
        SOP_Content: updated.SOP_Content,
        Team_in_charge                
      }
    });
  } catch (err) {
    next(err);
  }
};
const saveSop = async (req, res) => {
  const { SOP_ID, Personal_ID } = req.body;
 
 
  if (!SOP_ID || !Personal_ID) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 SOP_ID 或 Personal_ID',
      code: 400
    });
  }
 
 
  try {
    const alreadySaved = await sopModel.checkIfSaved(SOP_ID, Personal_ID);
    if (alreadySaved) {
      return res.status(200).json({
        status: 'success',
        message: '資料已成功儲存。',
        code: 200
      });
    }
 
 
    await sopModel.saveSopForUser(SOP_ID, Personal_ID);
 
 
    res.status(200).json({
      status: 'success',
      message: '資料已成功儲存。',
      code: 200
    });
  } catch (err) {
    console.error('[SAVE_SOP_ERROR]', err);
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
      code: 500
    });
  }
 };
 const unsaveSop = async (req, res) => {
  const { SOP_ID, Personal_ID } = req.body;

  if (!SOP_ID || !Personal_ID) {
    return res.status(400).json({
      status: 'error',
      message: '缺少 SOP_ID 或 Personal_ID',
      code: 400
    });
  }

  try {
    await sopModel.unsaveSopForUser(SOP_ID, Personal_ID); // 無論存不存在都刪
    res.status(200).json({
      status: 'success',
      message: '資料已成功取消收藏。',
      code: 200
    });
  } catch (err) {
    console.error('[UNSAVE_SOP_ERROR]', err);
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤',
      code: 500
    });
  }
};
 
const historylist = async (req, res) => {
  const sopId = req.params.sop_id;

  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {sop, history} = await sopModel.gethistorylist(sopId);
    if (!sop) {
      return res.status(404).json({ status: 'fail', message: `NOT FOUND ${sopId}` });
    }
    
    res.json({
      status: 'success',
      history: [...history]
    });
  } catch (err) {
    console.error(`[SOP_ERROR] Failed to list history version ${sopId}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};

const displayhistory = async (req, res) => {
  const sopId = req.params.sop_id;
  const version = req.params.version;
  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {sop,  edges, module} = await sopModel.gethistorysop(sopId, version);
    if (!sop) {
      return res.status(404).json({ status: 'fail', message: 'NOT FOUND SOP' });
    }

    //await logSOPView(req, sopId); // 記錄瀏覽行為
    //const viewCount = await Viewers_NUM(sopId); // 查瀏覽數
    
    res.json({
      status: 'success',
      data:{...sop,
      nodes:module,
      edges:edges},
      message: `You viewed SOP ${sopId}`,
      version: version
    });

  } catch (err) {
    console.error(`[SOP_ERROR] Failed to load SOP ${sopId} in ${version}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};



//Concurrency Control
const updateSopStatus = async (req, res) => {
  const sopId = req.params.sop_id;
  const { status, editor, Admin_ID } = req.body;

  // 檢查參數是否齊全
  if (!status || !editor || !Admin_ID) {
    return res.status(400).json({ status: 'error', reason: '缺少必要欄位' });
  }

  const result = await sopstatus.handleSopStatusUpdate(sopId, status, editor, Admin_ID);
  
  switch (result.status) {
    case 'success':
      return res.status(200).json(result);
    case 'noop':
      return res.status(200).json(result);
    case 'reject':
      return res.status(409).json(result); // 409 Conflict
    case 'error':
    default:
      return res.status(500).json(result);
  }
};



const Checkstatus = async (req, res) => {
  const sopId = req.params.sop_id;

  try {
    const [[sop]] = await db.query(`
      SELECT status, edit_name, TIMESTAMPDIFF(MINUTE, last_updated_time, NOW()) AS minutes_passed
      FROM SOP
      WHERE SOP_ID = ?
    `, [sopId]);

    if (!sop) return res.status(404).json({ error: 'SOP not found' });

    if (sop.status === 'updating' && sop.minutes_passed < 3) {
      return res.json({
        status: 'reject',
        edit_name: sop.edit_name || '其他人',
      });
    }

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('[CHECK STATUS ERROR]', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
};



module.exports = { Checkstatus,getSopPage,searchSops,getModule,createSOP,updateSopinfo,saveSop ,unsaveSop, historylist, displayhistory,updateSopStatus  };
