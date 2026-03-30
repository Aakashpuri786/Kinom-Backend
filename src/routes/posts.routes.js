const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/postsController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id', getById);
router.post('/', authUser, create);
router.put('/:id', authUser, update);
router.delete('/:id', authUser, remove);

module.exports = router;
