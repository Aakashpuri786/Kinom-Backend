const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/contactController');

const router = express.Router();

router.post('/', create);
router.get('/', list);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
