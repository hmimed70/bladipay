const catchAsyncError =  require("../middlewares/catchAsyncError");
const User =  require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const { sendPasswordResetEmail }= require('../utils/sendEmail');
const signToken = require("../utils/sendToken");


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo


const util = require('util');


const {  cleanupUploadedFile, createUploader} = require('../utils/UploadHelper');
// Custom uploader for user avatars
const upload = util.promisify(
  createUploader({
    directory: '../uploads/avatar',
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    fieldName: 'avatar'
  })
);




exports.RegisterUser = catchAsyncError(async (req, res, next) => {
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
    
    const { nom, prenom, email, password, telephone   } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { telephone }] });
if (existingUser) {
  if(req.file?.filename) {
    cleanupUploadedFile(req.file.filename, '../uploads/avatar');
  }
  return next(new ErrorHandler('Email ou téléphone déjà utilisé.', 400));
}

    try {
      const lastUser = await User.findOne().sort({ createdAt: -1 });
    const nextUserNumber = lastUser 
      ? parseInt(lastUser.userId.slice(3)) + 1 
      : 1;
    const userId = `USR${String(nextUserNumber).padStart(4, '0')}`;

    const user = await User.create({
      userId,
        nom,
        prenom,
        email,
        password,
        avatar: req?.file?.filename || null,
        telephone
    });
    const token =  signToken(user._id);
        res.status(201).json({
      success: true,
      token,
      user 
    });
  }
     catch (dbError) {
          if (req.file?.filename) {
    cleanupUploadedFile(req.file.filename, '../uploads/avatar');
          }
          console.error(dbError);
          return next(new ErrorHandler('Erreur lors de la création du compte.', 500));
        }
});


exports.LoginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("S'il vous plaît entrez votre email et votre mot de passe", 400));
  }

  const user = await User.findOne({ email, active: true }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Email ou mot de passe incorrect", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email ou mot de passe incorrect", 401));
  }
  const sendedUsr = {
    _id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role
  }
    const token =  signToken(user._id);
        res.status(200).json({
      success: true,
      token,
      user: sendedUsr
    });
})

exports.logout = (req, res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};


 

/*
exports.forgotPassword = catchAsyncError(async(req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler('Please enter Email', 404)); 
  }
  const user = await User.findOne({ email: req.body.email });

     if(!user) return next(new ErrorHandler('User Email doesnt register yet', 404));

     const userResetToken = await user.getResetPasswordToken();
     await user.save({ validateBeforeSave: false });


      try {
        const resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${userResetToken}`;
        await sendPasswordResetEmail(user, resetURL, `${__dirname}/../view/reset-password.handlebars`);
      
        res.status(200).json({
          status: 'success',
          message: `Token sent to ${user.email} successfully`,
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
          new ErrorHandler('There was an error sending the email. Try again later!'),
          500
        );
      }

});


exports.resetPassword = catchAsyncError(async (req, res, next) => {

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();


  sendToken(user, 200,req, res);
});
*/
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  try {
    if(!req?.body?.password || !req?.body?.passwordCurrent) {
      return next(new ErrorHandler('Veuillez fournir le mot de passe actuel et le nouveau mot de passe', 400));
    }
    if(req?.body?.password === req?.body?.passwordCurrent) {
     return next(new ErrorHandler('le nouveau mot de passe doit différent du mot de passe actuel', 400));
    }
    const user = await User.findById(req?.user?._id).select('+password');
    if (!user) {
      return next(new ErrorHandler('Utilisateur introuvable', 404));
    }

    const isMatch = await user.comparePassword(req.body.passwordCurrent);
    if (!isMatch) {
      return next(new ErrorHandler('Le mot de passe actuel est incorrect.', 401));
    }

    user.password = req.body.password;
    
    await user.save();
    user.password = undefined;
    const token =  signToken(user._id);
        res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new ErrorHandler(`Validation Erreur : ${error.message}`, 400));
    }
    return next(error);
  }
});



