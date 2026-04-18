const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/galleryController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authAdmin, create);
router.put('/:id', authAdmin, update);
router.delete('/:id', authAdmin, remove);

module.exports = router;
