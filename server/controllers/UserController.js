const bcrypt = require('bcryptjs');
const { validateInput } = require("../utils/ValidateInput");
const catchAsyncError =  require("../middlewares/catchAsyncError");
const User =  require("../models/userModel");
const fs = require('fs');
const path = require('path');
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/Features");
const { filterBodyData } = require("../utils/helpers");

const cleanupUploadedFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads/avatar', filename);
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Erreur lors de la suppression du fichier : ${filePath}`, err);
  });
};
exports.updateMe = catchAsyncError(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new ErrorHandler("S'il vous plait utiliser /updateme pour modifier votre mot de passe",400)
      );
    }
        if(req?.body?.telephone !== req?.user?.telephone) {
      const isPhoneExist = await User.findOne({telephone: req.body.telephone});
      if (isPhoneExist) {
        return next(new ErrorHandler('Numéro de téléphone déjà utilisé', 400));
      };
    }
    if(req.body.email !== req?.user?.email) {
      const isEmailexist = await User.findOne({email: req?.body?.email});
      if (isEmailexist) {
        return next(new ErrorHandler('Email déjà utilisé', 400));
      };
    }
     const filterdData = filterBodyData(req.body, ['nom', 'prenom', 'email', 'telephone']);
  
    const user = await User.findByIdAndUpdate(req.user.id, filterdData, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
       user
    });
  });

  
  exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler('Utilisateur introuvable', 404));
    }

    // Delete the user
    if (user?.avatar) {
    cleanupUploadedFile(user.avatar);
    }
    await User.findByIdAndDelete(userId);

    res.status(200).json({
        success: true,
        message: "Utilisateur supprimé avec succès",
    });
});

  
  /*
  exports.deleteMe = catchAsyncError(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
  
    res.status(200).json({
      success: true,
      message: "User Delete Successfully",
    });
  });
*/
exports.createUser = catchAsyncError(async (req, res, next) => {
  const requiredFields = ['nom', 'telephone', 'prenom', 'email', 'password', 'role', 'active'];
  const missingFields = validateInput(req.body, requiredFields);
  
  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }
    const { nom,telephone, prenom, role, email, password, active} = req.body;
    const lastUser = await User.findOne().sort({ createdAt: -1 });
    const nextUserNumber = lastUser 
      ? parseInt(lastUser.userId.slice(3)) + 1 
      : 1;
    const userId = `USR${String(nextUserNumber).padStart(4, '0')}`;
    const user = await User.create({
        nom,
        prenom,
        role,
        telephone,
        userId,
        email,
        password,
       active,
  
    });
    res.status(200).json({
        success: true,
        message: "User created Successfully",
        user
      });
});

  exports.getAllUsers = catchAsyncError(async (req, res, next) => {

    const resultPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 8;
    // Get the total number of orders
    const usersCount = await User.countDocuments();
    
    // Initialize ApiFeatures with filtering and pagination logic
    const apiFeature = new ApiFeatures(User.find(), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .pagination(resultPerPage, req.query.page);
      const filteredUsersCount = await User.find(apiFeature.query.getFilter()).countDocuments();
  
    // Execute the query to get the orders
    const users = await apiFeature.query;
    
    // Calculate the filtered orders count accurately
    //const filteredOrdersCount = await Order.find(apiFeature.query.getFilter()).countDocuments();
  
    // Send the response with both counts
    res.status(200).json({
      success: true,
      users,
      usersCount, // Total orders count without filter
      filteredUsersCount, // Total filtered orders count
      resultPerPage,
    });
  })
  exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        
        return next(new ErrorHandler('Utilisateur introuvable',404)); 
    }
    user.password = undefined;

    res.status(200).json({
      success: true,
      user,
  });
  });
  exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };
  


  exports.updateUser = catchAsyncError(async (req, res, next) => {
    const requiredFields = ['nom', 'telephone', 'prenom', 'email', 'role'];
  const missingFields = validateInput(req.body, requiredFields);
  
  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }
    // Check if the password exists in the request body
    if (req.body.password) {
      if(req.body.password.length < 6){
        return next(new ErrorHandler('Password must be at least 6 characters', 400));
      }
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
  
      req.body.passwordChangedAt = Date.now() - 1000;
    }
    else delete req.body.password;
  
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if (!user) {
      return next(new ErrorHandler('No user found with that ID', 404));
    }
  
    res.status(200).json({
      success: true,
      user,
    });
  });
  

  