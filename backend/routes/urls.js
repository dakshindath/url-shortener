const express = require('express');
const { createUrl, getUrls, getUrl, updateUrl, deleteUrl, redirectUrl } = require('../controllers/urlController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, createUrl);
router.get('/', auth, getUrls);
router.get('/redirect/:shortUrl', redirectUrl); // Ensure this route does not use auth middleware
router.get('/:id', auth, getUrl);
router.put('/:id', auth, updateUrl);
router.delete('/:id', auth, deleteUrl);

module.exports = router;