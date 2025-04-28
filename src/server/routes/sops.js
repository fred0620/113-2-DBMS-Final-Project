// server/routes/sops.js
const express = require('express');
const router = express.Router();
const { searchSops,getSopPage } = require('../controllers/sop');


router.get('/search', searchSops);
router.get('/:sop_id/flowchart', getSopPage);
module.exports = router;
