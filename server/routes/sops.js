// server/routes/sops.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: 'Hello from backend!' });
});


const ctrl    = require('../controllers/sop');
router.post('/create', ctrl.createSOP);
router.get('/:sop_id/flowchart', ctrl.getSopPage);
router.get('/search', ctrl.searchSops);
router.get('/:module_id/display', ctrl.getModule );
router.patch('/:sop_id/info', ctrl.updateSopinfo);


const { recordModules } = require('../controllers/update_module');
router.post('/:sop_id/modules-batch', recordModules);

const { update_publish } = require('../controllers/publish');
router.put('/:sop_id/update_publish', update_publish);

module.exports = router;
