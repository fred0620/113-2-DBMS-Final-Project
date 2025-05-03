const sopModel = require('../models/sopsModel');
const moduleModel = require('../models/moduleModel');
const { logSOPView } = require('../services/viewService');
const { Viewers_NUM } = require('../models/viewModel');

const getSopPage = async (req, res) => {
  const sopId = req.params.sop_id;

  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {sop,  edges, module} = await sopModel.getSopById(sopId);
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
  let keyword = (req.query.keyword || '').trim();
  
  // 解碼 URL 中的關鍵字參數，確保編碼正確
  
  console.log('Received keyword:',keyword);

  const department = req.query.department || '';
  const team = req.query.team || '';

  console.log('Search Parameters:', { keyword, department, team });

  try {
    const sops = await sopModel.searchSops(keyword, department, team);
    res.json(sops);
  } catch (err) {
    console.error('[SOP_ERROR] Failed to search SOPs:', err.message);
    res.status(500).json({ error: 'Internal Server Error', detail: err.message });
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
      form_links: form.map(f => ({ Link: f.Link }))
    });
  } catch (err) {
    console.error(`[SOP_ERROR] Failed to load Module ${module_id}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};



module.exports = { getSopPage,searchSops,getModule };
