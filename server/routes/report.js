const express = require("express");
const router = express.Router();
const { exportReportHandler } = require("../controllers/reportController");

router.get("/export", exportReportHandler);

module.exports = router;
