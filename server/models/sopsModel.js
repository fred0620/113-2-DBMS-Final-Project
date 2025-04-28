const db=require('../config/db')

const getSopById = async (sopId) => {
  // 查 SOP 主資料
  const [[sop]] = await db.execute(`SELECT SOP_ID, SOP_Name,Team_Name, SOP_Content, Create_Time
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


module.exports = { getSopById };