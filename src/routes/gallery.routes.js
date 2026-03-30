const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/galleryController');
const { authAny } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authAny, create);
router.put('/:id', authAny, update);
router.delete('/:id', authAny, remove);

module.exports = router;
