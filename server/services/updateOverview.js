const { getLatestModuleUpdates, getSOPRecoverLogs } = require("../models/reportModel");
const { getModuleByIdWithVersion } = require("../models/reportModel");
const seenRecover = new Set();

function formatTime(dt) {
  return new Date(dt).toISOString().slice(0, 19).replace("T", " ");
}

async function UpdateOverview(team_name, start, end) {
  const updates = await getLatestModuleUpdates(team_name, start, end);
  console.log("📦 查詢結果筆數：", updates.length);
  const finalData = [];

  for (const row of updates) {
    const {
      Module_ID,
      SOP_ID,
      SOP_Name,
      Title,
      Action,
      Update_Time,
      Update_By,
      User_Name,
      Version
    } = row;



    if (!current) {
        console.warn("⚠️ 找不到模組內容（current 為 null）", Module_ID, Version);
        continue;
    }    

    // ✅ create
    if (Action === "create") {
        finalData.push([
        SOP_ID,
        SOP_Name,
        Title,
        Version,
        "Create new step",
        formatTime(Update_Time),
        User_Name
        ]);
    }

    // 🔄 update
    else if (Action === "update") {
        const { module: current, form: currentForm } = await getModuleByIdWithVersion(Module_ID, Version);
        const { module: prev, form: prevForm } = await getModuleByIdWithVersion(Module_ID, Version - 1);
        const changes = [];

        if (!prev) {
        // 沒有上一版就視為新建
        console.warn("⚠️ 找不到上一版模組內容", Module_ID, "Version", Version - 1);
        finalData.push([
            SOP_ID,
            SOP_Name,
            Title,
            Version,
            "Update: （無法比對前一版本）",
            formatTime(Update_Time),
            User_Name
        ]);
        continue;
        }

        if ((prev.Title || "") !== (current.Title || "")) changes.push("流程標題");
        if ((prev.Details || "") !== (current.Details || "")) changes.push("詳細內容");
        if ((prev.staff_in_charge || "") !== (current.staff_in_charge || "")) changes.push("負責人員");

        const prevLink = prevForm[0]?.Link || "";
        const currLink = currentForm[0]?.Link || "";
        if (prevLink !== currLink) changes.push("文件連結");

        const actionStr = changes.length > 0 ? `Update: ${changes.join("、")}` : "Update: 無變更";
        finalData.push([
        SOP_ID,
        SOP_Name,
        Title,
        Version,
        actionStr,
        formatTime(Update_Time),
        User_Name
        ]);
    }

        // ♻️ recover
    else if (Action === "recover") {

    const key = `${SOP_ID}-${formatTime(Update_Time)}`;
        if (seenRecover.has(key)) {
            console.log("看過了", key)
            continue; // 跳過重複的 recover 資料
        }
        seenRecover.add(key);

        const logs = await getSOPRecoverLogs(SOP_ID, Update_Time);

        if (!logs || logs.length === 0) {
            finalData.push([
            SOP_ID,
            SOP_Name,
            "-",
            Version,
            "Recover (無對應 log 記錄)",
            formatTime(Update_Time),
            User_Name || "未知"
            ]);
            continue;
        }


        const logContent = logs[0].log || "Recover";

        finalData.push([
            SOP_ID,
            SOP_Name,
            "",
            Version,
            logContent,
            formatTime(Update_Time),
            logs.User_Name
        ]);
    }
    else {
        console.warn("❓ 未知 Action：", Action);
    }

  }


  return finalData;
}

module.exports = { UpdateOverview };
