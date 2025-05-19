const db=require('../config/db')

const getSopById = async (sopId) => {
  // 查 SOP 主資料
  const [[sop]] = await db.execute(`SELECT SOP_ID, SOP_Name,Team_Name, Location, SOP_Content, Create_Time
    FROM SOP, Team 
    WHERE Team_in_charge=Team_ID AND SOP_ID = ?`, [sopId]);
  if (!sop) return null;
  
  // find biggest Version
  const[[version]]=await db.execute(`SELECT Max(Version) as New_Version
    FROM Module
    WHERE SOP_ID = ?`, [sopId]);
  if (!version?.New_Version)  return null;

  // 查 edges
  const [edges] = await db.execute(`
    SELECT  from_module, to_module
    FROM Edges
    Where Version_Edge=?
    ORDER BY Edge_ID ASC;`, [version.New_Version]);

  //查 Module
  const [module] = await db.execute(`
    SELECT Module_ID,  Title, Details,  staff_in_charge, type
    FROM Module
    Where Version=?
    ORDER BY Module_ID ASC;`, [version.New_Version]);

  return {sop, version: version.New_Version, edges, module};
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
  WHERE 1=1
`;

  console.log('Generated SQL Query:', query);
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
  console.log("Generated SQL Query:", query);
  console.log('Query Values:', values);
  const [rows] = await db.execute(query, values);
  console.log('Database query result:', rows);
  return rows;
  
};
// server/models/sopsModel.js （片段）
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

module.exports = { getSopById,searchSops,createSop,updateSopinfo };