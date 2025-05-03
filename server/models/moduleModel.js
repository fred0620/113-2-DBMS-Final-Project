const db=require('../config/db')

const getModuleById = async (module_id) => {

    // find biggest Version
    const[[version]]=await db.execute(`SELECT Max(Version) as New_Version
        FROM Module
        WHERE Module_ID = ?;`, [module_id]);
    if (!version?.New_Version)  return null;
  
    // 查 Module（staff_in_charge 可為 NULL）
    const [moduleRows] = await db.execute(`
        SELECT M.type, M.Module_ID,
            M.Title, M.Details,
            U.User_Name,
            D.Department_Name AS Department,
            T.Team_Name AS Team,
            A.Ex_number
        FROM Module M
        LEFT JOIN Administrator A ON M.staff_in_charge = A.Administrator_ID
        LEFT JOIN Team T ON T.Team_ID = A.Team_ID
        LEFT JOIN Department D ON D.Department_ID = T.Department_ID
        LEFT JOIN User U ON A.Personal_ID = U.Personal_ID
        WHERE M.Module_ID = ?
        AND M.Version = ?;
    `, [module_id, version.New_Version]);
  
    
      const module = moduleRows[0]
    
    //查 Form_Link
    const [form] = await db.execute(`
      SELECT Link
      FROM Form_Link
      Where Module_ID = ?
      AND Version_Link = ?;`, [module_id, version.New_Version]);
  
    return {module, form};
  };


  module.exports = { getModuleById };