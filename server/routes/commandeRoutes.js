const express = require('express');
const router = express.Router();
const {
  createRecharge,
  createAchatEuros,
  createAchatDinars,
  getAllCommandes,
  getCommande,
  getMyCommandes,
  deleteCommande,
  confirmCommande,
  requestConfirmAchatEuros,

} = require('../controllers/CommandeController');

const { isAuthenticated, isAdmin, isUser } = require('../middlewares/auth');

// Apply authentication middleware where necessary
router
  .route('/')
  .get(isAuthenticated, isAdmin, getAllCommandes); // Admin only
router
  .route('/my_commandes')
  .get(isAuthenticated, isUser, getMyCommandes); // Admin only

router.put('/confirm_commande/:id', isAuthenticated, isAdmin, confirmCommande);

router.put('/request_confirm_commande/:id', isAuthenticated, isUser, requestConfirmAchatEuros);

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
