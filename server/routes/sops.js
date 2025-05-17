// server/routes/sops.js
const express = require('express');
const router = express.Router();
const sopsController = require('../controllers/sop');
router.get('/', (req, res) => {
  res.json({ success: true, data: 'Hello from backend!' });
});

const { getSopPage } = require('../controllers/sop');
const { searchSops } = require('../controllers/sop');

const ctrl    = require('../controllers/sop');
const { getModule } = require('../controllers/sop');
router.post('/create', ctrl.createSOP);
router.get('/:sop_id/flowchart', getSopPage);
router.get('/search', searchSops);
router.get('/:module_id/display', getModule );
router.patch('/:sop_id/info', ctrl.updateSopinfo);
router.post('/save', sopsController.saveSop);
const { recordModules } = require('../controllers/update_module');
router.post('/:sop_id/modules-batch', recordModules);

module.exports = router;
