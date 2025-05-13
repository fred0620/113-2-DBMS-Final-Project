const userM = require('../models/user');
const adminM = require('../models/admin');
const studentM = require('../models/stu');
//const bcrypt = require('bcrypt'); // 密碼比對

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // 比對密碼
  /*
  const passwordMatch = await bcrypt.compare(password, user.Password);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }*/
  if (user.Password !== password) {
    throw new Error('Invalid credentials');
  }
  
  // 確認身份
  const [studentData, adminData] = await Promise.all([
    studentM.checkStudent(user.Personal_ID),
    adminM.checkAdmin(user.Personal_ID)
  ]);

  let identity = 'Outsider';
  if (studentData.length && adminData.length) {
    identity = 'Both';
  } else if (studentData.length) {
    identity = 'Student';
  } else if (adminData.length) {
    identity = 'Administrator';
  }

  const details = [];

  if (studentData.length === 1) {
    const student = studentData[0];
    details.push({
        Identity: 'Student',
        id: student.Student_ID,
        department: student.Department_Name,
        team: student.Team_Name
    });
  }

  if (adminData.length === 1) {
    const admin = adminData[0];
    details.push({
        Identity: 'Administrator',
        id: admin.Administrator_ID,
        department: admin.Department_Name,
        team: admin.Team_Name,
        Position: admin.Position,
        Ex_number: admin.Ex_number
    });
  }

  return {
    user: {
      id: user.Personal_ID,
      User_Name: user.User_Name,
      Identity: identity,
      details
    }
  };
};

module.exports = { login };
