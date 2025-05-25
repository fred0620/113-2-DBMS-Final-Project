const db=require('../config/db')

const getSopById = async (sopId) => {
  // 查 SOP 主資料
  const [[sop]] = await db.execute(`
    SELECT SOP_ID, SOP_Name, Team_ID, Team_Name, Location, SOP_Content, Create_Time, is_publish
    FROM SOP, Team 
    WHERE Team_in_charge = Team_ID AND SOP_ID = ?
  `, [sopId]);

  if (!sop) return null;

  // 查最大版本
  const [[version]] = await db.execute(`
    SELECT MAX(Version) as New_Version
    FROM Module
    WHERE SOP_ID = ?
  `, [sopId]);

  if (!version?.New_Version) return null;

  const versionNumber = version.New_Version;

  // 查 Module 資料
  const [moduleRows] = await db.execute(`
    SELECT M.Module_ID, M.Title, M.Details, M.staff_in_charge, M.type,
           U.User_Name, D.Department_Name, D.Department_ID,
           T.Team_Name, T.Team_ID, A.Ex_number, U.Email 
    FROM Module M
    LEFT JOIN Administrator A ON M.staff_in_charge = A.Administrator_ID
    LEFT JOIN Team T ON T.Team_ID = A.Team_ID
    LEFT JOIN Department D ON D.Department_ID = T.Department_ID
    LEFT JOIN User U ON A.Personal_ID = U.Personal_ID
    WHERE M.Version = ? AND M.SOP_ID = ?
    ORDER BY M.Module_ID ASC
  `, [versionNumber, sopId]);

  // 把每個 module 加上 form_links
  const module = await Promise.all(moduleRows.map(async (m) => {
    const [formRows] = await db.execute(`
      SELECT Link, Link_Name
      FROM Form_Link
      WHERE Module_ID = ? AND Version_Link = ?
    `, [m.Module_ID, versionNumber]);

    return {
      ...m,
      form_links: formRows
    };
  }));

  // 查 Edges
  const moduleIds = module.map(m => m.Module_ID);
  const placeholders = moduleIds.map(() => '?').join(',');

  const [edges] = await db.execute(`
    SELECT from_module, to_module
    FROM Edges
    WHERE Version_Edge = ?
      AND (from_module IN (${placeholders}) OR to_module IN (${placeholders}))
    ORDER BY Edge_ID ASC
  `, [versionNumber, ...moduleIds, ...moduleIds]);

  // 回傳整體 SOP 結構
  return {
    sop,
    version: versionNumber,
    module,
    edges
  };
};


const gethistorysop = async (sopId, version) => {
  // 查 SOP 主資料
  const [[sop]] = await db.execute(`SELECT SOP_ID, SOP_Name,Team_Name, Location, SOP_Content, Create_Time, is_publish
    FROM SOP, Team 
    WHERE Team_in_charge=Team_ID AND SOP_ID = ?`, [sopId]);
  if (!sop) return null;

  //查 Module
  const [module] = await db.execute(`
    SELECT Module_ID,  Title, Details,  staff_in_charge, type
    FROM Module
    Where Version=?
    AND SOP_ID =?
    ORDER BY Module_ID ASC;`, [version, sopId]);

  // 把 Module_ID 做成陣列
  const moduleIds = module.map(m => m.Module_ID);
  
  const placeholders = moduleIds.map(() => '?').join(',');

  // 查 edges
  const [edges] = await db.execute(`
    SELECT  from_module, to_module
    FROM Edges
    Where Version_Edge=?
    AND (from_module IN (${placeholders}) OR to_module IN (${placeholders}))
    ORDER BY Edge_ID ASC;`, [version, ...moduleIds, ...moduleIds]);

  
  return {sop,  module, edges};
};

const searchPublicSops = async (keyword = '', department = '', team = '') => {
  let query = `
    SELECT SOP.SOP_ID as id, SOP.SOP_Name as title, SOP.SOP_Content as description,
           Department.Department_Name as department, Team.Team_Name as team,
           null as owner
    FROM SOP
    LEFT JOIN Team ON SOP.Team_in_charge = Team.Team_ID
    LEFT JOIN Department ON Team.Department_ID = Department.Department_ID
    WHERE SOP.is_publish = 'publish'
  `;

  const values = [];

  if (keyword) {
    query += ` AND SOP.SOP_Name LIKE ?`;
    values.push(`%${keyword}%`);
  }

  if (department) {
    query += ` AND Department.Department_Name = ?`;
    values.push(department.trim());
  }

  if (team) {
    query += ` AND Team.Team_Name = ?`;
    values.push(team.trim());
  }

  console.log('[SQL]', query);
  console.log('[VALUES]', values);

  const [rows] = await db.query(query, values);
  return rows;
};


const searchSavedSops = async (keyword = '', personalId) => {
  let query = `
    SELECT SOP.SOP_ID as id, SOP.SOP_Name as title, SOP.SOP_Content as description,
           Department.Department_Name as department, Team.Team_Name as team
    FROM Save
    JOIN SOP ON Save.SOP_ID = SOP.SOP_ID
    LEFT JOIN Team ON SOP.Team_in_charge = Team.Team_ID
    LEFT JOIN Department ON Team.Department_ID = Department.Department_ID
    WHERE Save.Personal_ID = ?
      AND SOP.is_publish = 'publish'
  `;

  const values = [personalId];

  if (keyword && keyword.trim() !== '') {
    query += ` AND SOP.SOP_Name LIKE ?`;
    values.push(`%${keyword.trim()}%`);
  }

  console.log('[searchSavedSops] SQL:', query);
  console.log('[searchSavedSops] VALUES:', values);

  const [rows] = await db.query(query, values);
  return rows;
};

const searchMySops = async (keyword = '', teamName) => {
  let query = `
    SELECT SOP.SOP_ID as id, SOP.SOP_Name as title, SOP.SOP_Content as description,
           Department.Department_Name as department, Team.Team_Name as team, SOP.is_publish
    FROM SOP
    LEFT JOIN Team ON SOP.Team_in_charge = Team.Team_ID
    LEFT JOIN Department ON Team.Department_ID = Department.Department_ID
    WHERE Team.Team_Name = ?
  `;

  const values = [teamName];

  if (keyword && keyword.trim() !== '') {
    query += ` AND SOP.SOP_Name LIKE ?`;
    values.push(`%${keyword.trim()}%`);
  }

  console.log('[searchMySops] SQL:', query);
  console.log('[searchMySops] VALUES:', values);

  const [rows] = await db.query(query, values);
  return rows;
};



const createSop = async ({ SOP_Name, SOP_Content, Team_ID }) => {

  const [insertResult] = await db.query(
    'INSERT INTO SOP (SOP_Name, SOP_Content, Team_in_charge) VALUES (?,?,?)',
    [SOP_Name, SOP_Content, Team_ID]
  );
  
  let newId = insertResult.insertId;
  if (!newId) {
    const [rows] = await db.query(
      'SELECT SOP_ID FROM SOP WHERE SOP_Name=? AND Team_in_charge=? ORDER BY Create_Time DESC LIMIT 1',
      [SOP_Name, Team_ID]
    );
    newId = rows[0]?.SOP_ID ?? null;
  }
  return {
    id: newId,
    SOP_Name,
    SOP_Content,
    Team_in_charge: Team_ID     
  };
};
const updateSopinfo = async ({ SOP_ID, SOP_Name, SOP_Content, Team_ID, Updated_by, logText }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE SOP 
       SET SOP_Name = ?, SOP_Content = ?, Team_in_charge = ? 
       WHERE SOP_ID = ?`,
      [SOP_Name, SOP_Content, Team_ID, SOP_ID]
    );
    await conn.execute(
      `INSERT INTO SOP_log (SOP_ID, Administrator_ID, Log)
       VALUES (?,?,?)`,
      [SOP_ID, Updated_by, logText]
    );

    await conn.commit();
    return {
      id: SOP_ID,
      SOP_Name,
      SOP_Content,
      Team_in_charge: Team_ID
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
const checkIfSaved = async (sopId, personalId) => {
  const [rows] = await db.query(
    'SELECT 1 FROM Save WHERE SOP_ID = ? AND Personal_ID = ?',
    [sopId, personalId]
  );
  return rows.length > 0;
 };
 
 
 // 實際收藏 SOP
 const saveSopForUser = async (sopId, personalId) => {
  await db.query(
    'INSERT INTO Save (SOP_ID, Personal_ID) VALUES (?, ?)',
    [sopId, personalId]
  );
 };

 const unsaveSopForUser = async (sopId, personalId) => {
  await db.query(
    'DELETE FROM Save WHERE SOP_ID = ? AND Personal_ID = ?',
    [sopId, personalId]
  );
};


//Version control
const gethistorylist = async (sopId) => {
  // 確認SOPID是否存在
  const [[sop]] = await db.execute(`
    SELECT SOP_ID
    FROM SOP
    WHERE SOP_ID = ?`, [sopId]);
  
  // find biggest Version
  const [history]=await db.execute(`
    SELECT distinct Version as version, Max(Create_Time) as Update_Time
    FROM Module
    WHERE SOP_ID = ?
    group by Version
    order by Version asc
    `, [sopId]);

  return {sop, history};
};


async function insertSOPLog(sopId, adminId, logText) {
  try {
    const conn = await pool.getConnection();
    await conn.execute(
      `INSERT INTO SOP_log (SOP_ID, Administrator_ID, log)
       VALUES (?, ?, ?)`,
      [sopId, adminId, logText]
    );
    conn.release();
    console.log("✅ 成功寫入 SOP_log");
  } catch (err) {
    console.error("❌ 寫入 SOP_log 失敗：", err);
    throw err;
  }
}


//Concurreny Control

async function getSopForUpdate(conn, sopId) {
  if (!sopId) throw new Error('SOP_ID is required');
  const [rows] = await conn.execute(
    `SELECT status,editor_id, edit_name
    FROM SOP 
    WHERE SOP_ID = ? 
    FOR UPDATE`,
    [sopId]
  );
  return rows[0];
}

async function updateSopStatus(conn, sopId, status, editor = null, editor_id = null) {
  if (!sopId || !status) throw new Error('SOP_ID and status are required');
  await conn.execute(
    `UPDATE SOP 
    SET status = ?, edit_name = ? , editor_id =?
    WHERE SOP_ID = ?`,
    [status, editor, editor_id,  sopId]
  );
}


module.exports = { getSopById, gethistorysop, searchPublicSops,
  searchMySops,searchSavedSops,createSop,updateSopinfo,checkIfSaved,
  saveSopForUser,unsaveSopForUser, gethistorylist,getSopForUpdate,

  updateSopStatus,insertSOPLog};




