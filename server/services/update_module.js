// server/services/update_module.js
const { create_module,update_module, update_edges } = require('../models/update_module');
const sopModel = require('../models/sopsModel');
const db = require('../config/db');

const getSopVersion = async (sopId) => {
    const sopData = await sopModel.getSopById(sopId);
    if (sopData && sopData.version) {
      return sopData.version + 1;
    } else {
      return 1;
    }
};

const processModules = async (modules, editor, sopId, version, edges ) => {
    const connection = await db.getConnection();
    await connection.beginTransaction(); // 開啟交易
  try {
    const clientIdToModuleIdMap = {};  // 用來儲存 client_id 和 Module_ID 的對照

    // 分割為 create 和 update
    const create_modules = modules.filter(module => module.action === 'create');
    const update_modules = modules.filter(module => module.action !== 'create');
  
    // 1. 處理 create_modules 插入資料
    if (create_modules.length > 0) {for (const module of create_modules) {
      const {newModuleId} = await create_module(module,editor, sopId, version, connection); // 假設這是你處理插入的函數
      clientIdToModuleIdMap[module.Module_ID] = newModuleId;
      console.log("Mapping client id", module.Module_ID, "to DB id", newModuleId);

      }
    }  
  
    // 2. 處理 update_modules 更新資料
    if (update_modules.length > 0) {
          console.log(`開始更新 ${update_modules.length} 個 modules`);
        await update_module(update_modules,editor, sopId, version, connection); // 假設這是你處理更新的函數
    } else {
        console.log('沒有 modules 需要更新');
    }
    
     if (Array.isArray(edges) && edges.length > 0) {
      const edges_v2 = await transformEdges(edges, clientIdToModuleIdMap);
      if (edges_v2.length > 0) {
        await update_edges(edges_v2, version, connection);
      } else {
        console.log('⚠️ transformEdges 回傳空陣列，跳過 update_edges');
      }
    } else {
      console.log('⚠️ edges 是空陣列或不存在，跳過 update_edges');
    }

    
    await connection.commit();    // ✅ 提交交易
    console.log("✅ Transaction committed");

    return {
      success: true,
      message: 'Modules and edges processed successfully'
    };
  } catch (error) {
        await connection.rollback(); // 回滾
        console.error("❌ Transaction rolled back:", error.message);
        throw error;
    } finally {
    connection.release();
  }
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
