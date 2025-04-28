const db=require('../config/db')

const getSopById = async (sopId) => {
  // 查 SOP 主資料
  const [sop] = await db.execute(`SELECT SOP_ID, SOP_Name,Team_Name, SOP_Content
    FROM SOP, Team 
    WHERE Team_in_charge=Team_ID AND SOP_ID = ?`, [sopId]);
  if (!sop) return null;
  
  // 抓最新更新時間
  const Create_Time = await db.execute(`SELECT Create_Time
    FROM SOP 
    WHERE SOP_ID = ?`, [sopId]);
  if (!sop) return null;

  // 查 edges
  const [edges] = await db.execute(`WITH latest_modules AS (
    SELECT Module_ID,Create_Time, ROW_NUMBER() OVER (PARTITION BY Module_ID ORDER BY create_time DESC) AS rn
    FROM Module
    WHERE SOP_ID = ?
    )
    SELECT  e.from_module, e.to_module
    FROM Edges e
    JOIN latest_modules m_from 
    ON e.from_module = m_from.Module_ID 
    AND e.from_create_time=m_from.Create_Time  
    AND m_from.rn = 1
    JOIN latest_modules m_to 
    ON e.to_module = m_to.Module_ID 
    AND e.to_create_time=m_to.Create_Time 
    AND m_to.rn = 1
    ORDER BY e.Edge_ID ASC;`, [sopId]);

  const edgeIds = [...new Set(edges.flatMap(edge => [edge.from_module, edge.to_module]))];
  
  //查 Module
  const [module] = await db.execute(`WITH latest_modules AS (
    SELECT Module_ID,  Title, Details,  staff_in_charge, type,
    ROW_NUMBER() OVER (PARTITION BY Module_ID ORDER BY create_time DESC) AS rn
    FROM Module
    WHERE SOP_ID = ?
    )
    SELECT Module_ID,  Title, Details,  staff_in_charge, type
    FROM latest_modules
    WHERE rn = 1
    AND Module_ID IN (${edgeIds.map(() => '?').join(',')})
    ORDER BY Module_ID ASC;`, [sopId, ...edgeIds]);


  return {sop, edges, module};
};


module.exports = { getSopById };