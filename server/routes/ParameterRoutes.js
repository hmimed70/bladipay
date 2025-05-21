const express = require('express');
const router = express.Router();
const { setParameters, getParameters } = require('../controllers/ParameterController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router
  .route('/')
  .get(getParameters) // Public or Authenticated
  .post(isAuthenticated, isAdmin, setParameters); // Only admin can update

module.exports = router;
