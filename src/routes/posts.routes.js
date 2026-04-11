const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/postsController');

const router = express.Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
