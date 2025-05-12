const express = require('express');
const router = express.Router();
const { userregister } = require('../controllers/user');

router.post('/register', userregister);

module.exports = router;
