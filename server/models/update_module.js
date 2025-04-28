// server/models/update_module.js
const db=require('../config/db')

const update_edges = async (edges,version) => {
    
    // 準備插入的資料
    const insEdges = edges.map(edge => [
        edge.from_module,  // from_module
        edge.to_module,    // to_module
        version            // version
    ]);
    
    await db.execute(`
        insert into Edges (from_module, to_module, Version_Edge)
        values ?
        `,[insEdges])
};

const create_module = async (module,editor, sopId, version) => {
    try {
      
      const values =  [
        module.Type,
        module.Title,
        module.Details,
        sopId,
        module.staff_in_charge,
        version,
        editor
      ];
      
      // 2. Insert到Module
      const [result] = await db.execute(`
        INSERT INTO Module (Type, Title, Details, SOP_ID, staff_in_charge, Version, Update_by)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `, values);
      
      //這組資料新創的id
      const newModuleId = result.insertId;

      // 3. Insert到Link
      if (module.form_links && Array.isArray(module.form_links) && module.form_links.length > 0) {
        const formLinkValues = module.form_links
          .filter(linkObj => Array.isArray(linkObj.Link) && linkObj.Link.length > 0) // 確保 linkObj.Link 是陣列
          .flatMap(linkObj => linkObj.Link.map(link => [
            newModuleId,
            link,
            version
          ]));
      
        if (formLinkValues.length > 0) {
          await db.query(`
            INSERT INTO Form_Link (Module_ID, Link, Version_Link)
            VALUES ?
          `, [formLinkValues]);
        }
      }

      // 4. 返回插入的資料
      return {
        success: true,
        message: 'Created Modules Insert successfully',
        newModuleId,  // 返回所有插入資料的 Module_ID
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
  
  const update_module = async (modules,editor, sopId, version) => {
    try {
      const clientIdToModuleIdMap = {};
      
      // 1. 準備批量插入資料
      const values = modules.map(module => [
        module.Module_ID,
        module.Type,
        module.Title,
        module.Details,
        sopId,
        module.staff_in_charge,
        version,
        editor
      ]);
      
      const placeholders = modules.map(() => '(?,?,?,?,?,?,?,?)').join(',');
      const flatValues = values.flat();

      // 2. Insert到Module
      await db.execute(`
        INSERT INTO Module (Module_ID, Type, Title, Details, SOP_ID, staff_in_charge, Version, Update_by)
        VALUES ${placeholders};
      `, flatValues);
      

      // 3. 準備所有 form_links 的資料
      const formLinkValues = modules.reduce((acc, module) => {
        if (module.form_links && Array.isArray(module.form_links) && module.form_links.length > 0) {
          const links = module.form_links
            .filter(linkObj => Array.isArray(linkObj.Link) && linkObj.Link.length > 0)
            .flatMap(linkObj => linkObj.Link.map(link => [
              module.Module_ID,
              link,
              version
            ]));
          acc.push(...links);
        }
        return acc;
      }, []);
      
  
      // 4. 如果有 form_links 資料，批量插入到 Form_Link 表
      if (formLinkValues.length > 0) {
        await db.query(`
          INSERT INTO Form_Link (Module_ID, Link, Version_Link)
          VALUES ?
        `, [formLinkValues]);
      }

      // 4. 返回插入的資料
      return {
        success: true,
        message: 'Updated Modules Insert successfully'
      };
    } catch (error) {
      console.error('Error updating modules:', error);
      return {
        success: false,
        message: 'Failed to update modules',
        error: error.message,
      };
    }
  };

  module.exports = {
    create_module,update_module,update_edges
  };
  