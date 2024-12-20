const express = require('express');
const { signup, login, me } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;