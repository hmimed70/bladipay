const bcrypt = require('bcryptjs');
const { validateInput } = require("../utils/ValidateInput");
const catchAsyncError =  require("../middlewares/catchAsyncError");
const User =  require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/Features");
const { filterBodyData } = require("../utils/helpers");
const Commande = require('../models/commandeModel');
const util = require('util');



const {  cleanupUploadedFile, createUploader} = require('../utils/UploadHelper');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Custom uploader for user avatars
const upload = util.promisify(
  createUploader({
    directory: '../uploads/avatar',
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    fieldName: 'avatar'
  })
);

exports.updateMe = catchAsyncError(async (req, res, next) => {

  try {
    await upload(req, res);
  } catch (err) {
    const message = {
      'LIMIT_FILE_SIZE': `Photo trop grande. Limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`,
      'LIMIT_FILE_COUNT': "Veuillez envoyer uniquement une photo.",
      'LIMIT_UNEXPECTED_FILE': err.message || "Type de fichier non autorisé."
    }[err.code] || 'Erreur lors de l’envoi de la photo.';
    return next(new ErrorHandler(message, 400));
  }
   if (req.body.password || req.body.passwordConfirm) {
    if (req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/avatar');
    return next(new ErrorHandler("Veuillez utiliser /updateMyPassword pour modifier le mot de passe", 400));
  }

  const { nom, prenom, email, telephone, avatarDelete } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    if (req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/avatar');
    return next(new ErrorHandler("Utilisateur non trouvé", 404));
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      if (req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/avatar');
      return next(new ErrorHandler("Email déjà utilisé", 400));
    }
  }

  if (telephone && telephone !== user.telephone) {
    const phoneExists = await User.findOne({ telephone });
    if (phoneExists) {
      if (req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/avatar');
      return next(new ErrorHandler("Numéro de téléphone déjà utilisé", 400));
    }
  }

  if (avatarDelete === 'true' && user.avatar) {
    cleanupUploadedFile(user.avatar, '../uploads/avatar');
    user.avatar = undefined;
  }

  if (req.file?.filename) {
    if (user.avatar) cleanupUploadedFile(user.avatar, '../uploads/avatar');
    user.avatar = req.file.filename;
  }

  user.nom = nom || user.nom;
  user.prenom = prenom || user.prenom;
  user.email = email || user.email;
  user.telephone = telephone || user.telephone;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profil mis à jour avec succès",
    data: { user }
  });
});


  
  exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const userId = req.params.id;

    // Check if user exists
    const hasCommandes = await Commande.findOne({ clientId: userId });
    if(hasCommandes) {
        return next(new ErrorHandler("Vous devez supprimer toutes les commandes de l'utilisateur avant de supprimer l'utilisateur", 400));
    }
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler('Utilisateur introuvable', 404));
    }

    // Delete the user
    if (user?.avatar) {
    cleanupUploadedFile(user.avatar, '../uploads/avatar');
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
  const requiredFields = ['nom', 'telephone', 'prenom', 'email', 'role', 'active'];
  const missingFields = validateInput(req.body, requiredFields);

  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Champs obligatoires manquants : ${missingFields.join(', ')}`, 400));
  }

  const { nom, prenom, email, role, active, telephone, password, avatar } = req.body;

  // Check if user exists first
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("Aucun utilisateur trouvé avec cet identifiant.", 404));
  }

  // Email uniqueness check
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (emailExists) {
      return next(new ErrorHandler("Cet e-mail est déjà utilisé par un autre utilisateur.", 400));
    }
  }

  // Phone uniqueness check
  if (telephone && telephone !== user.telephone) {
    const telephoneExists = await User.findOne({ telephone, _id: { $ne: req.params.id } });
    if (telephoneExists) {
      return next(new ErrorHandler("Ce numéro de téléphone est déjà utilisé par un autre utilisateur.", 400));
    }
  }

  // Prepare update data
  const updateData = { nom, prenom, email, role, active, telephone };

  // Handle password update
  if (password) {
    if (password.length < 6) {
      return next(new ErrorHandler("Le mot de passe doit contenir au moins 6 caractères.", 400));
    }
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
    updateData.passwordChangedAt = Date.now() - 1000;
  }
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Utilisateur mis à jour avec succès.",
    user: updatedUser,
  });
});

exports.deleteUserPhoto = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("Utilisateur introuvable", 404));
  }
  if (user.avatar) {
    cleanupUploadedFile(user.avatar,'../uploads/avatar');
  }
  user.avatar = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Photo de profil supprimée avec succès.",
    user,
  });
});