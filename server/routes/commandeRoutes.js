const express = require('express');
const router = express.Router();
const {
  createRecharge,
  createAchatEuros,
  createAchatDinars,
  getAllCommandes,
  getCommande,
  deleteCommande,
} = require('../controllers/CommandeController');

const { isAuthenticated, isAdmin } = require('../middlewares/auth');

// Apply authentication middleware where necessary
router
  .route('/')
  .get(isAuthenticated, isAdmin, getAllCommandes); // Admin only
  

router
  .route('/recharge')
  .post(isAuthenticated, createRecharge);

router
  .route('/achat_euros')
  .post(isAuthenticated, createAchatEuros);

router
  .route('/achat_dinars')
  .post(isAuthenticated, createAchatDinars);

router
  .route('/:id')
  .get(isAuthenticated, getCommande)
  .delete(isAuthenticated, isAdmin, deleteCommande); // Admin only

module.exports = router;
