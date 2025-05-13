const express = require('express');
const router = express.Router();
const { userregister } = require('../controllers/user');

router.post('/register', userregister);

const auth    = require('../controllers/login');
router.post("/login", auth.login);

module.exports = router;
