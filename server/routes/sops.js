// server/routes/sops.js
const express = require('express');
const router = express.Router();
const ctrl    = require('../controllers/sop');
router.get('/', (req, res) => {
  res.json({ success: true, data: 'Hello from backend!' });
});



router.post('/create', ctrl.createSOP);
router.get('/:sop_id/flowchart', ctrl.getSopPage);
router.get('/search', ctrl.searchSops);
router.get('/:module_id/display', ctrl.getModule );
router.patch('/:sop_id/info', ctrl.updateSopinfo);
router.post('/save', ctrl.saveSop);


const update = require('../controllers/update_module');
router.post('/:sop_id/modules-batch', update.recordModules);

const { update_publish } = require('../controllers/publish');
router.put('/:sop_id/update_publish', update_publish);
router.post('/unsave', ctrl.unsaveSop);

//Version control
router.get('/:sop_id/history', ctrl.historylist);
router.get('/:sop_id/history/:version', ctrl.displayhistory);
router.post('/:sop_id/recover/:version', update.recoversop);

//Concurrency Control
router.patch('/:sop_id/status', ctrl.updateSopStatus);

module.exports = router;
