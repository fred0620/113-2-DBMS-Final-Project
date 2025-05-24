const db=require('../config/db')
const dayjs = require("dayjs");

const pool = require("../config/db");

async function getSocialInteraction(team_name,start,end) {
  const start_input = dayjs(start).format("YYYY-MM-DD");
  const end_input = dayjs(end).format("YYYY-MM-DD"); 
  const [rows] = await pool.query(`
    SELECT S.SOP_ID,
     S.SOP_Name,
     COUNT(DISTINCT V.View_ID) AS view,
     COUNT(DISTINCT A.Personal_ID) AS save
    FROM SOP S
    LEFT JOIN Team T ON S.Team_in_charge = T.Team_ID
    LEFT JOIN Views V ON S.SOP_ID = V.SOP_ID AND V.View_Time BETWEEN ? AND ?
    LEFT JOIN Save A ON S.SOP_ID = A.SOP_ID
    WHERE T.Team_Name = ?
    GROUP BY S.SOP_ID, S.SOP_Name
    `, [start_input, end_input, team_name]);
  return rows;
}

async function getNewSOP(team_name,start,end) {
  const start_input = dayjs(start).format("YYYY-MM-DD");
  const end_input = dayjs(end).format("YYYY-MM-DD");

  const [rows] = await pool.query(`
    SELECT S.SOP_ID, S.SOP_Name, S.Create_Time
    FROM SOP S
    LEFT JOIN Team T ON S.Team_in_charge = T.Team_ID
    WHERE T.Team_Name = ?
    AND S.Create_Time BETWEEN ? AND ?
  `, [team_name, start_input, end_input]);

  return rows;
}

async function getSOPLogs(team_name,start,end) {
  const start_input = dayjs(start).format("YYYY-MM-DD");
  const end_input = dayjs(end).format("YYYY-MM-DD"); 
  const [rows] = await pool.query(`
    SELECT S.SOP_ID,B.SOP_Name, S.log, S.Update_time, U.User_Name
    FROM SOP_log S
    LEFT JOIN Administrator A ON S.Administrator_ID = A.Administrator_ID
    LEFT JOIN User U ON A.Personal_ID = U.Personal_ID
    LEFT JOIN SOP B ON S.SOP_ID = B.SOP_ID
    LEFT JOIN Team T ON B.Team_in_charge = T.Team_ID
    WHERE T.Team_Name = ?
    AND S.Update_time BETWEEN ? AND ?
  `, [team_name,start_input,end_input]);

  return rows;
}

async function getLatestModuleUpdates(team_name, start, end) {
  const start_input = dayjs(start).format("YYYY-MM-DD");
  const end_input = dayjs(end).format("YYYY-MM-DD"); 
  const [rows] = await db.execute(`
    SELECT M.Module_ID, M.SOP_ID, S.SOP_Name, M.Title,
           M.Action, M.Create_Time AS Update_Time, M.Update_by AS Update_By, M.Version, U.User_Name
    FROM Module M
    JOIN SOP S ON M.SOP_ID = S.SOP_ID
    JOIN Team T ON S.Team_in_charge = T.Team_ID
    LEFT JOIN Administrator A ON M.Update_by = A.Administrator_ID
    LEFT JOIN User U ON A.Personal_ID = U.Personal_ID
    WHERE T.Team_Name = ?
      AND M.Create_Time BETWEEN ? AND ?
      AND M.Action IN ('create', 'update', 'recover')
  `, [team_name, start_input, end_input]);

  return rows;
}


async function getModuleByIdWithVersion(module_id, version) {
  const [moduleRows] = await db.execute(`
    SELECT M.Module_ID, M.Title, M.Details,M.Create_Time AS Update_Time, M.Update_by AS Update_By, M.Action, M.SOP_ID, S.SOP_Name, M.staff_in_charge
    FROM Module M
    LEFT JOIN SOP S ON M.SOP_ID = S.SOP_ID
    WHERE M.Module_ID = ? AND M.Version = ?
  `, [module_id, version]);

  const [form] = await db.execute(`
    SELECT Link, Link_Name
    FROM Form_Link
    WHERE Module_ID = ? AND Version_Link = ?
  `, [module_id, version]);

  return { module: moduleRows[0], form };
}

async function getSOPRecoverLogs(SOP_ID, updateTime) {
  const [rows] = await db.execute(`
    SELECT S.Administrator_ID, S.log, S.Update_time, U.User_Name
    FROM SOP_log S
    LEFT JOIN Administrator A ON S.Administrator_ID = A.Administrator_ID
    LEFT JOIN User U ON A.Personal_ID = U.Personal_ID
    WHERE SOP_ID = ?
      AND DATE(Update_time) = DATE(?) 
    ORDER BY ABS(TIMESTAMPDIFF(SECOND, Update_time, ?)) ASC
  `, [SOP_ID, updateTime, updateTime]);

  return rows;
}

async function getTeamManager(team_name) {
  const [rows] = await db.execute(`
    SELECT U.User_Name
    FROM Team T
    JOIN Administrator A ON T.ManagerT_ID = A.Administrator_ID
    JOIN User U ON A.Personal_ID = U.Personal_ID
    WHERE T.Team_Name = ?
  `, [team_name]);
  if (rows.length === 0) {
  throw new Error(`No manager found for team: ${team_name}`);
}
  return rows.length > 0 ? rows[0].User_Name : null;
}



module.exports = {
  getSocialInteraction,
  getNewSOP,
  getLatestModuleUpdates,
  getModuleByIdWithVersion,
  getSOPRecoverLogs,
  getSOPLogs,
  getTeamManager
};


