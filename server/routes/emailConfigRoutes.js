const express = require('express');
const router = express.Router();
const {
  createEmailConfig,
  getAllEmailConfigs,
  getEmailConfig,
  updateEmailConfig,
  deleteEmailConfig,
  verifyEmailConnection,
  setEmailConfigActive
} = require('../controllers/EmailConfigController');

const { isAdmin,isAuthenticated } = require('../middlewares/auth');

// All routes are protected
router
  .route('/')
  .post(isAuthenticated, isAdmin, createEmailConfig)
  .get(isAuthenticated, isAdmin, getAllEmailConfigs);

router
  .route('/:id')
  .get(isAuthenticated, isAdmin, getEmailConfig)
  .delete(isAuthenticated, isAdmin, deleteEmailConfig);

// Verify SMTP Connection
router
  .route('/verify-connection')
  .post(isAuthenticated, isAdmin, verifyEmailConnection);
router.put('/set-active/:id', isAuthenticated, isAdmin, setEmailConfigActive);

module.exports = router;
