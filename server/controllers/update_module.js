const { update_edges } = require('../models/update_module');
const { getSopVersion, processModules, transformEdges } = require('../services/update_module');


// 處理來自前端的 POST 請求
const recordModules = async (req, res) => {
    const sopId = req.params.sop_id;
    const { modules,  edges, Updated_by } = req.body;  // 從請求中獲取資料
    const version = await getSopVersion(sopId)

    try {
      // 將資料傳遞給 Service 層進行處理
      const result = await processModules(modules, Updated_by,sopId, version );
      const edges_v2= await transformEdges(edges, result.clientIdToModuleIdMap);
      await update_edges(edges_v2, version)

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
  
  module.exports = {
    recordModules  // 將函數匯出
};

