const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

const { isAuthenticated, isAdmin } = require('../middlewares/auth');

const userRoute = express.Router();

userRoute.route('/login').post(AuthController.LoginUser);
userRoute.route('/register').post(AuthController.RegisterUser);


userRoute.use(isAuthenticated);
userRoute.route('/logout').get(AuthController.logout);
userRoute.route('/updateMe').patch(UserController.updateMe);
//userRoute.route('/deleteMe').delete(UserController.deleteMe);
userRoute.route('/updatePassword').patch( AuthController.updatePassword);

userRoute.route('/getme').get(UserController.getMe, UserController.getUserDetails);
userRoute.use(isAdmin)
userRoute
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);

  userRoute
  .route('/:id')
  .get(UserController.getUserDetails)
  .put(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = userRoute ;