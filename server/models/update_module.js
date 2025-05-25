// server/models/update_module.js
const db=require('../config/db')

const update_edges = async (edges,version, connection) => {
    if (!edges || edges.length === 0) {
        console.log('⚠️ No edges to update.');
        return;
    }

    
    // 準備插入的資料
    const insEdges = edges.map(edge => [
        edge.from_module,  // from_module
        edge.to_module,    // to_module
        version            // version
    ]);

    const placeholders = insEdges.map(() => '(?,?,?)').join(',');
    const flatValues = insEdges.flat();
    
    await connection.execute(`
        insert into Edges (from_module, to_module, Version_Edge)
        values ${placeholders}
        `, flatValues)
};

const create_module = async (module,editor, sopId, version, connection) => {
    try {

        // 空字串轉 null
        let staffInCharge = module.staff_in_charge;
        if (!staffInCharge || staffInCharge.trim() === '') {
          staffInCharge = null;
        }
        
      const values =  [
        module.Type,
        module.Title,
        module.Details,
        sopId,
        staffInCharge,
        version,
        editor,
        module.action
      ];
      
      // 2. Insert到Module
      const [result] = await connection.execute(`
        INSERT INTO Module (Type, Title, Details, SOP_ID, staff_in_charge, Version, Update_by, Action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `, values);
      console.log("⚙️ insert result:", values);
      // 立刻查剛剛那筆的 Module_ID
      const [rows] = await connection.execute(`
        SELECT Module_ID FROM Module WHERE Title = ? AND SOP_ID = ? AND Version=? AND Update_by=? ORDER BY Module_ID DESC LIMIT 1;
      `, [module.Title, sopId, version,editor]);

      console.log("⚙️ ModuleID:", rows);
      //這組資料新創的id
      const newModuleId = rows[0].Module_ID;

      // 3. Insert到Link
      if (module.form_links && Array.isArray(module.form_links) && module.form_links.length > 0) {
        const formLinkValues = module.form_links
          .filter(linkObj => typeof linkObj.Link === 'string' && linkObj.Link.length > 0)
          .map(linkObj => [
            newModuleId,
            linkObj.Link,
            version
          ]);
      
        if (formLinkValues.length > 0) {
          await connection.execute(`
            INSERT INTO Form_Link (Module_ID, Link, Version_Link)
            VALUES ${formLinkValues.map(() => '(?,?,?)').join(',')}
          `, formLinkValues.flat());
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
  
  const update_module = async (modules,editor, sopId, version, connection) => {
    try {
      const clientIdToModuleIdMap = {};
      
      // 1. 準備批量插入資料
      const values = modules.map(module => {
          let staffInCharge = module.staff_in_charge;
          if (!staffInCharge || staffInCharge.trim() === '') {
            staffInCharge = null;
          }
          return [
            module.Module_ID,
            module.Type,
            module.Title,
            module.Details,
            sopId,
            staffInCharge,
            version,
            editor,
            module.action
          ];
        });
      
      const placeholders = modules.map(() => '(?,?,?,?,?,?,?,?,?)').join(',');
      const flatValues = values.flat();

      // 2. Insert到Module
      await connection.execute(`
        INSERT INTO Module (Module_ID, Type, Title, Details, SOP_ID, staff_in_charge, Version, Update_by, Action)
        VALUES ${placeholders};
      `, flatValues);
      

      // 3. 準備所有 form_links 的資料
      const formLinkValues = modules.reduce((acc, module) => {
        if (module.form_links && Array.isArray(module.form_links) && module.form_links.length > 0) {
          const links = module.form_links
            .filter(linkObj => typeof linkObj.Link === 'string' && linkObj.Link.length > 0)
            .map(linkObj => [
              module.Module_ID,
              linkObj.Link,
              version
            ]);
          acc.push(...links);
        }
        return acc;
      }, []);
      
  
      // 4. 如果有 form_links 資料，批量插入到 Form_Link 表
      if (formLinkValues.length > 0) {
        await connection.query(`
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

const recoverSopVersion = async (sopId, version, createdBy) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Step 2: 找最新版本號
    const [[{ maxVersion }]] = await connection.query(
      'SELECT MAX(Version) AS maxVersion FROM Module WHERE SOP_ID = ?',
      [sopId]
    );
    const newVersion = (maxVersion || 0) + 1;

    const logText = `Recover to V${version}`;
    await connection.execute(
        `INSERT INTO SOP_log (SOP_ID, Administrator_ID, Log)
        VALUES (?,?,?)`,
        [sopId, createdBy, logText]
      );
    
    // Step 1: 抓該版本的所有 module 資料
    const [oldModules] = await connection.query(
      `SELECT Module_ID, type,  Title, Details,  staff_in_charge
      FROM Module 
      WHERE SOP_ID = ? 
      AND Version = ?`,
      [sopId, version]
    );

    if (oldModules.length === 0) {
      throw new Error('SOP_ID  Version no data');
    }

    // 把 Module_ID 做成陣列
    const moduleIds = oldModules.map(m => m.Module_ID);
    
    const placeholders = moduleIds.map(() => '?').join(',');

    // 查 edges
    const [edges] = await connection.execute(`
      SELECT  from_module, to_module
      FROM Edges
      Where Version_Edge=?
      AND (from_module IN (${placeholders}) OR to_module IN (${placeholders}))
      ORDER BY Edge_ID ASC;`, [version, ...moduleIds, ...moduleIds]);
    
    if (edges.length === 0) {
      throw new Error('edges are nothing');
    }


    // 查 Form_Link
      const [link] = await connection.execute(`
        SELECT  Module_ID, Link, Link_Name
        FROM Form_Link
        Where Version_Link=?
        AND (Module_ID IN (${placeholders}))
        ORDER BY Link_ID ASC;`, [version, ...moduleIds]);

    // Step 3: 批次複製舊資料，改版本號 → 插入新資料
    const insertValues = oldModules.map(row => [
      row.Module_ID,
      row.type,
      row.Title,
      row.Details,
      sopId,
      row.staff_in_charge,
      newVersion,          
      createdBy,
      'recover'
    ]);

    await connection.query(
      `INSERT INTO Module 
        (Module_ID, type,  Title, Details ,SOP_ID, staff_in_charge, Version, Update_by, Action) 
      VALUES ?`,
      [insertValues]
    );

    const insertValues1 = edges.map(row => [
      row.from_module,
      row.to_module,
      newVersion         
    ]);

    await connection.query(
      `INSERT INTO Edges 
        (from_module, to_module, Version_Edge) 
      VALUES ?`,
      [insertValues1]
    );

    if (link.length > 0) {
      const insertValues2 = link.map(row => [
        row.Module_ID,
        row.Link,
        newVersion,
        row.Link_Name,         
      ]);

      await connection.query(
        `INSERT INTO Form_Link 
          (Module_ID, Link, Version_Link,Link_Name) 
        VALUES ?`,
        [insertValues2]
      );
    }
    await connection.commit();
    return newVersion;
    }catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  };



  module.exports = {
    create_module,update_module,update_edges, recoverSopVersion
  };
  
