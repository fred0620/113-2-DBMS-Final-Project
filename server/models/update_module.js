const db=require('../config/db')


const create_module = async (modules, sopId, version) => {
    try {
      // 1. 準備批量插入資料
      const values = modules.map(module => [
        module.Type,
        module.Title,
        module.Details,
        sopId,
        module.staff_in_charge,
        version
      ]);
      
      // 2. 使用批量插入語法執行插入
      const [create_result] = await db.execute(`
        INSERT INTO Module (Type, Title, Details, SOP_ID, staff_in_charge, Version)
        VALUES ?;
      `, [values]);
    
      // 2. 使用批量插入語法執行插入
      const [create_result] = await db.execute(`
        INSERT INTO Module (Type, Title, Details, SOP_ID, staff_in_charge, Version)
        VALUES ?;
      `, [values]);

      // 4. 返回插入的資料
      return {
        success: true,
        message: 'Created Modules Insert successfully',
        moduleIds,  // 返回所有插入資料的 Module_ID
      };
    } catch (error) {
      console.error('Error creating modules:', error);
      return {
        success: false,
        message: 'Failed to create modules',
        error: error.message,
      };
    }
  };
  
  module.exports = {
    create_module,
  };
  