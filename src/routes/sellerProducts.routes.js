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

router.get('/', list);
router.get('/my', authUser, listMy);
router.get('/all', authUser, listAll);
router.get('/:id', getById);
router.post('/', authUser, create);
router.patch('/:id', authUser, update);
router.delete('/:id', authUser, remove);

module.exports = router;
