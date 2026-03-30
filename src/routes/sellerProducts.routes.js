const express = require('express');
const {
  list,
  listMy,
  listAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/sellerProductsController');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.use(authUser);

router.get('/', list);
router.get('/my', listMy);
router.get('/all', listAll);
router.get('/:id', getById);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
