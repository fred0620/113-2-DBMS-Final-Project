const db=require('../config/db')

const getLatestModulesBySOPID = async (sopId) => {
    const [rows] = await db.execute(
       `WITH latest_modules AS (
        SELECT Module_ID, type, Title, staff_in_charge, create_time,
        ROW_NUMBER() OVER (PARTITION BY Module_ID ORDER BY create_time DESC) AS rn
        FROM Module
        WHERE SOP_ID = ?
        )
        SELECT Module_ID, type, Title, staff_in_charge, create_time
        FROM latest_modules
        WHERE rn = 1
        ORDER BY Module_ID ASC;`,
        [sopId]
    );
    return rows;
  };
  
  module.exports = { getLatestModulesBySOPID }