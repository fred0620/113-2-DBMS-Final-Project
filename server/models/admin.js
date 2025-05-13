const db=require('../config/db')

const checkAdmin = async (personalId) => {
    const [rows] = await db.query(`
      SELECT a.Administrator_ID, d.Department_Name, t.Team_Name, a.Position, a.Ex_number
      FROM Administrator a
      JOIN Team t ON a.Team_ID = t.Team_ID
      JOIN Department d ON t.Department_ID = d.Department_ID
      WHERE a.Personal_ID = ?`, 
      [personalId]
    );
    return rows;
  };
  
  module.exports = { checkAdmin };