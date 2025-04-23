const db=require('../config/db')

const getSopById = async (sopId) => {
  // 1. 查 SOP 主資料
  const [[sop]] = await db.execute('SELECT * FROM SOP WHERE SOP_ID = ?', [sopId]);

  if (!sop) return null;

  // 2. 查 nodes
  const [nodes] = await db.execute(`WITH latest_modules AS (
        SELECT Module_ID,  Title, Details,  staff_in_charge, type,
        ROW_NUMBER() OVER (PARTITION BY Module_ID ORDER BY create_time DESC) AS rn
        FROM Module
        WHERE SOP_ID = ?
        )
        SELECT Module_ID,  Title, Details,  staff_in_charge, type
        FROM latest_modules
        WHERE rn = 1
        ORDER BY Module_ID ASC;`, [sopId]);

  // 3. 查 edges
  const [edges] = await db.execute(`WITH latest_modules AS (
      SELECT Module_ID, ROW_NUMBER() OVER (PARTITION BY Module_ID ORDER BY create_time DESC) AS rn
      FROM Module
      WHERE SOP_ID = ?
      )
      SELECT e.Edge_ID, e.from_module, e.to_module
      FROM Edges e
      JOIN latest_modules m_from ON e.from_module = m_from.Module_ID AND m_from.rn = 1
      JOIN latest_modules m_to ON e.to_module = m_to.Module_ID AND m_to.rn = 1
      ORDER BY e.Edge_ID ASC;`, [sopId]);

  // 4. 組合格式
  return { sop, nodes, edges };
};

module.exports = { getSopById };