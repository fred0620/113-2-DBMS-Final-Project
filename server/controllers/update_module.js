const { update_edges, recoverSopVersion } = require('../models/update_module');
const { getSopVersion, processModules, transformEdges } = require('../services/update_module');
const { insertSOPLog } = require('../models/sopsModel');

// 處理來自前端的 POST 請求
const recordModules = async (req, res) => {
    console.log('📥 前端傳來的 modules 資料:', req.body);  
    const sopId = req.params.sop_id;
    const { modules,  edges, Updated_by } = req.body;  // 從請求中獲取資料
    const version = await getSopVersion(sopId)

    try {
      // 將資料傳遞給 Service 層進行處理
      const result = await processModules(modules, Updated_by,sopId, version, edges );
      const log = await insertSOPLog(sopId, Updated_by, "Update SOP Process");

      // 返回成功的回應
      return res.status(200).json(result);  // 200 表示成功
    } catch (error) {
      // 捕獲錯誤並返回錯誤訊息
      console.error('Error processing modules:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to process modules',
        error: error.message
      });
    }
  };

  const recoversop = async (req, res) => {
    const sopId = req.params.sop_id;
    const version = req.params.version;
    const adminId = req.body.Updated_by;
    const newVersion = await recoverSopVersion(sopId, version, adminId);

    console.log({status:'sucess', message: `Successfully recover Version ${version}` });

    try {

      return res.status(200).json({status:'sucess', message: `Successfully recover Version ${version}` });  // 200 表示成功
    } catch (error) {
      // 捕獲錯誤並返回錯誤訊息
      console.error('Error recover sop:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to recover sop',
        error: error.message
      });
    }
  };
  
  

  module.exports = {
    recordModules,recoversop
};

