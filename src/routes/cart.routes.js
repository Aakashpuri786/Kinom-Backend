const express = require('express');
const { getCart, addToCart, removeItem, clearCart } = require('../controllers/cartController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.use(authUser);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;
