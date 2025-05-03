// server/routes/sops.js
const express = require('express');
const router = express.Router();

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


module.exports = router;
