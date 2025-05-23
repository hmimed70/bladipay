const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const User = require("../models/userModel");
const { promisify } = require('util');

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new ErrorHandler('L\'utilisateur associé à ce jeton n\'existe plus.', 401));
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isAdmin = catchAsyncError((req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorHandler('Accès refusé. Vous n\'avez pas les autorisations nécessaires pour accéder à cette ressource.', 403));
  }
  next();
});

exports.isUser = catchAsyncError((req, res, next) => {
  if (req.user.role !== 'client') {
    return next(new ErrorHandler('Accès refusé. Cette ressource est réservée aux clients.', 403));
  }
  next();
});
