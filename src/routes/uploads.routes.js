const express = require('express');
const { upload, uploadFile } = require('../controllers/uploadsController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/', authUser, upload.single('file'), uploadFile);

module.exports = router;
