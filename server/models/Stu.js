const db=require('../config/db')

const checkStudent = async (personalId) => {
    const [rows] = await db.query(`
      SELECT s.Student_ID, d.Department_Name, t.Team_Name, t.Team_ID, d.Department_ID
      FROM Student s
      JOIN Team t ON s.Team_ID = t.Team_ID
      JOIN Department d ON t.Department_ID = d.Department_ID
      WHERE s.Personal_ID = ?`, 
      [personalId]
    );
    return rows;
  };
  
  module.exports = { checkStudent };