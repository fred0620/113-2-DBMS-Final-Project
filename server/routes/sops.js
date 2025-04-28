// server/routes/sops.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: 'Hello from backend!' });
});

const { getSopPage } = require('../controllers/sop');
router.get('/:sop_id/flowchart', getSopPage);

const { recordModules } = require('../controllers/update_module');
router.post('/:sop_id/modules-batch', recordModules);

module.exports = router;
