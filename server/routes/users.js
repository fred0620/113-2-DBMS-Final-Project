const express = require('express');
const router = express.Router();
const { userregister, searchUserskeyword } = require('../controllers/user');


router.post('/register', userregister);

const auth    = require('../controllers/login');
router.post("/login", auth.login);
router.get('/search', searchUserskeyword);
module.exports = router;
