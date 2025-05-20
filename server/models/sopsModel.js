const db=require('../config/db')

const getSopById = async (sopId) => {
  // 查 SOP 主資料
  const [[sop]] = await db.execute(`SELECT SOP_ID, SOP_Name,Team_Name, Location, SOP_Content, Create_Time, is_publish
    FROM SOP, Team 
    WHERE Team_in_charge=Team_ID AND SOP_ID = ?`, [sopId]);
  if (!sop) return null;
  
  // find biggest Version
  const[[version]]=await db.execute(`SELECT Max(Version) as New_Version
    FROM Module
    WHERE SOP_ID = ?`, [sopId]);
  if (!version?.New_Version)  return null;

  //查 Module
  const [module] = await db.execute(`
    SELECT Module_ID,  Title, Details,  staff_in_charge, type
    FROM Module
    Where Version=?
    AND SOP_ID =?
    ORDER BY Module_ID ASC;`, [version.New_Version, sopId]);

  // 把 Module_ID 做成陣列
  const moduleIds = module.map(m => m.Module_ID);
  
  const placeholders = moduleIds.map(() => '?').join(',');

  // 查 edges
  const [edges] = await db.execute(`
    SELECT  from_module, to_module
    FROM Edges
    Where Version_Edge=?
    AND (from_module IN (${placeholders}) OR to_module IN (${placeholders}))
    ORDER BY Edge_ID ASC;`, [version.New_Version, ...moduleIds, ...moduleIds]);

  
  return {sop, version: version.New_Version, module, edges};
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


const searchSops = async (keyword, department, team) => {
  
  let query = `
  SELECT 
    SOP.SOP_ID as id, 
    SOP.SOP_Name as title, 
    SOP.SOP_Content as description, 
    Department.Department_Name as department,
    Team.Team_Name as team,
    null as owner
  FROM SOP
  LEFT JOIN Team ON SOP.Team_in_charge = Team.Team_id
  LEFT JOIN Department ON Team.Department_ID = Department.Department_ID
  WHERE 1=1 AND is_publish='publish'
`;

  
const values = [];

  if (keyword) {
    query += ` AND SOP_Name LIKE ? `;
    values.push(`%${keyword}%`);
  }

  if (department) {
    query += ` AND Department.Department_Name = ?`;
    values.push(department.trim());
  }

  if (team) {
    query += ` AND Team.Team_Name = ?`;
    values.push(team);
  }

  const [rows] = await db.execute(query, values);
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
const updateSopinfo = async ({ SOP_ID, SOP_Name, SOP_Content, Team_ID, Updated_by }) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE SOP 
       SET SOP_Name = ?, SOP_Content = ?, Team_in_charge = ? 
       WHERE SOP_ID = ?`,
      [SOP_Name, SOP_Content, Team_ID, SOP_ID]
    );
    const logText = `Updated SOP fields by ${Updated_by}`;
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
module.exports = { getSopById, gethistorysop, searchSops,createSop,updateSopinfo,checkIfSaved,saveSopForUser,unsaveSopForUser, gethistorylist};
