// server/services/update_module.js
const { create_module,update_module } = require('../models/update_module');
const sopModel = require('../models/sopsModel');


const getSopVersion = async (sopId) => {
    const sopData = await sopModel.getSopById(sopId);
    if (sopData && sopData.version) {
      return sopData.version + 1;
    } else {
      return 1;
    }
};

const processModules = async (modules, editor, sopId, version ) => {
    const clientIdToModuleIdMap = {};  // 用來儲存 client_id 和 Module_ID 的對照

    // 分割為 create 和 update
    const create_modules = modules.filter(module => module.action === 'create');
    const update_modules = modules.filter(module => module.action !== 'update');
  
    // 1. 處理 create_modules 插入資料
    if (create_modules.length > 0) {for (const module of create_modules) {
      const newModuleId = await create_module(module, sopId, version); // 假設這是你處理插入的函數
      clientIdToModuleIdMap[module.Module_ID] = newModuleId;
      }
    }  
  
    // 2. 處理 update_modules 更新資料
    if (update_modules.length > 0) {
      await update_module(update_modules,editor, sopId, version); // 假設這是你處理更新的函數
    }
  
    return {
      success: true,
      message: 'Modules processed successfully',
      clientIdToModuleIdMap
    };
};

const transformEdges = (edges, clientIdToModuleIdMap) => {
    return edges.map(edge => {
      // 根據 client_id 查找對應的 Module_ID
      const fromModuleId = clientIdToModuleIdMap[edge.from_module] || edge.from_module; // 如果找不到對應的 Module_ID，就保持原來的 client_id
      const toModuleId = clientIdToModuleIdMap[edge.to_module] || edge.to_module; // 如果找不到對應的 Module_ID，就保持原來的 client_id
  
      // 返回轉換後的 edge
      return {
        from_module: fromModuleId,
        to_module: toModuleId
      };
    });
};

module.exports = { getSopVersion, processModules, transformEdges };
