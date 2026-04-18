const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/contactController');
const { authAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', create);
router.get('/', authAdmin, list);
router.get('/:id', authAdmin, getById);
router.put('/:id', authAdmin, update);
router.delete('/:id', authAdmin, remove);

module.exports = router;
