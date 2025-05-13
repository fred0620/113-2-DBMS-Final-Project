const db=require('../config/db')




const checkUserByEmail = async (email) => {
    const [rows] = await db.query(`
        SELECT Personal_ID, User_Name , Password
        FROM User 
        WHERE Email = ?`, [email]);
    return rows[0];
  };
  
  module.exports = { checkUserByEmail };