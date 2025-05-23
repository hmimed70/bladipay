const nodemailer = require('nodemailer');
const EmailConfig = require('../models/emailConfigModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');



// Get All EmailConfigs
exports.getAllEmailConfigs = catchAsyncError(async (req, res, next) => {
  const configs = await EmailConfig.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, configs , count: configs.length });
});

// Get One EmailConfig
exports.getEmailConfig = catchAsyncError(async (req, res, next) => {
  const config = await EmailConfig.findById(req.params.id);
  if (!config) return next(new ErrorHandler('Email config not found', 404));
  res.status(200).json({ success: true, config });
});
exports.createEmailConfig = catchAsyncError(async (req, res, next) => {
  const { name, smtpHost, smtpPort, secure, authUser, authPass, isActive } = req.body;

  if(isActive) {
    await EmailConfig.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );
  }
  // Check required fields
  if (!name || !smtpHost || !smtpPort || !authUser || !authPass) {
    return next(new ErrorHandler('Champs requis manquants pour la configuration email.', 400));
  }
  const isExisting = await EmailConfig.findOne({ authUser, authPass });
  if (isExisting) {
    return next(new ErrorHandler('Une configuration avec ces informations existe deja.', 400));
  }
  // Verify SMTP connection
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    isActive: isActive === true ? true : false,
    auth: {
      user: authUser,
      pass: authPass,
    },
  });

  const verified = await new Promise((resolve) =>
    transporter.verify((error) =>  {
        console.log(error)
        resolve(!error)
})
  );

  if (!verified) {
    return next(new ErrorHandler('Impossible de se connecter au serveur SMTP avec les informations fournies.', 400));
  }

  // Create if verification passes
  const emailConfig = await EmailConfig.create(req.body);
  res.status(201).json({ success: true, emailConfig });
});


// Set Active EmailConfig
exports.setEmailConfigActive = catchAsyncError(async (req, res, next) => {
  const configId = req.params.id;

  const configToActivate = await EmailConfig.findById(configId);
  if (!configToActivate) {
    return next(new ErrorHandler('Email config not found', 404));
  }

  // If trying to deactivate and it's the only active one, block it
  if (req.body.isActive === false) {
    const activeCount = await EmailConfig.countDocuments({ isActive: true });
    if (activeCount === 1 && configToActivate.isActive) {
      return next(new ErrorHandler('Impossible de désactiver la seule configuration active.', 400));
    }

    // Just deactivate
    configToActivate.isActive = false;
    await configToActivate.save();
    return res.status(200).json({ success: true, config: configToActivate });
  }

  // Activate selected config
  configToActivate.isActive = true;
  await configToActivate.save();

  // Deactivate all other configs
  await EmailConfig.updateMany(
    { _id: { $ne: configId } },
    { $set: { isActive: false } }
  );

  res.status(200).json({ success: true, config: configToActivate });
});



// Delete EmailConfig
exports.deleteEmailConfig = catchAsyncError(async (req, res, next) => {

  const config = await EmailConfig.findById(req.params.id);
  if (!config) return next(new ErrorHandler("Email config n'exist pas", 404));
    if(config?.isActive) {
        return next(new ErrorHandler("Vous ne pouvez pas supprimer une config Email active", 400))
    }
    await config.delete();
  res.status(200).json({ success: true, message: 'Email config supprimée avec succès' });
});

exports.verifyEmailConnection = catchAsyncError(async (req, res, next) => {
  const { smtpHost, smtpPort, secure, authUser, authPass } = req.body;
if (!req.body.name || !req.body.smtpHost || !req.body.smtpPort || !req.body.authUser || !req.body.authPass) {
  return next(new ErrorHandler('Champs requis manquants pour la configuration email.', 400));
}



  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: authUser,
      pass: authPass,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      return next(new ErrorHandler(`Échec de la connexion: ${error.message}`, 400));
    } else {
      res.status(200).json({ success: true, message: 'Connexion réussie.' });
    }
  });
});

