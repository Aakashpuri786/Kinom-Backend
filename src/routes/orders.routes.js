const express = require('express');
const { list, create, updateStatus, remove } = require('../controllers/ordersController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.use(authUser);

router.get('/', list);
router.post('/', create);
router.patch('/:id/status', updateStatus);
router.delete('/:id', remove);

module.exports = router;
