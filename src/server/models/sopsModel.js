const db=require('../config/db')



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
module.exports = {
  
  searchSops 
};

