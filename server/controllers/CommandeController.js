const Parametre = require('../models/ParameterModel');

const Commande = require('../models/commandeModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const ApiFeatures = require('../utils/Features');
const { generateUniqueTrackingCode, areFloatsEqual } = require('../utils/helpers');

const util = require('util');

const MAX_FILE_SIZE = 5 * 1024 * 1024;


const { cleanupUploadedFile, createUploader } = require('../utils/UploadHelper');

const upload = util.promisify(
  createUploader({
    directory: '../uploads/commande',
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    fieldName: 'paymentReceiptUrl'
  })
);


exports.createRecharge = catchAsyncError(async (req, res, next) => {
  const type = 'recharge';
  const { user, amountPaid, amountReceived } = req.body;
  const errors = validateCommandeInput(req.body, type);
  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }
  const paidValue = parseFloat(amountPaid.value);
  const receivedValue = parseFloat(amountReceived.value);

  if (isNaN(paidValue) || isNaN(receivedValue)) {
    return next(new ErrorHandler("Montants invalides fournis.", 400));
  }

  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }
  console.log(param.rechargeOptions)
  const option = param.rechargeOptions.find(
    (opt) => opt.eur === receivedValue
  );

  if (!option) {
    return next(new ErrorHandler('Montant non pris en charge.', 400));
  }

  if (option.dzd !== paidValue) {
    return next(new ErrorHandler('Montant incohérent avec les paramètres de recharge.', 400));
  }

  req.body.type = type;
  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid: {
      value: paidValue,
      currency: 'DZD'
    },
    amountReceived: {
      value: receivedValue,
      currency: 'EUR'
    },
    paymentMethod: 'card',
    paymentStatus: 'confirmee',
    type,
  });

  res.status(201).json({
    success: true,
    message: "Commande Recharge Mobile créée avec succès",
    commande,
  });
});


exports.createAchatEuros = catchAsyncError(async (req, res, next) => {
  const type = 'achat_euros';
  const errors = validateCommandeInput(req.body, type);
  const { user, amountPaid, amountReceived } = req.body;


  const paidValue = parseFloat(amountPaid.value); //euros
  const receivedValue = parseFloat(amountReceived.value); //dinars

  if (isNaN(paidValue) || isNaN(receivedValue)) {
    return next(new ErrorHandler("Montants invalides fournis.", 400));
  }

  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }

  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }
  //Achat Euro : send baridimob to client , then client send da, admin send euro 
  //"euroToDinarRate": 260,
  // "dinarToEuroRate": 0.00387597,
  //amountReceived: dinars amountWillpaid: euro 
  // Validate amountPaid (EUR) vs amountReceived (DA)
  const expectedEuro = (receivedValue / param.achatEuros).toFixed(2);
  console.log(receivedValue, param.achatEuros, expectedEuro)
  if (!areFloatsEqual(paidValue, expectedEuro)) {
    return next(new ErrorHandler("`Montant reçu ne correspond pas au taux de change actuel", 400));
  }
  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid: {
      value: paidValue,
      currency: 'EUR'
    },
    amountReceived: {
      value: receivedValue,
      currency: 'DZD'
    },
    paymentMethod: 'baridimob',
    paymentStatus: 'en_attente',
    type,
  });

  res.status(201).json({
    success: true,
    message: "Commande Achat Euros créée avec succès",
    commande,
  });
});


exports.createAchatDinars = catchAsyncError(async (req, res, next) => {
  const type = 'achat_dinars';
  const errors = validateCommandeInput(req.body, type);
  const { user, amountPaid, amountReceived, paymentMethod } = req.body;
  const paidValue = parseFloat(amountPaid.value); //dinars
  const receivedValue = parseFloat(amountReceived.value); //euros

  if (isNaN(paidValue) || isNaN(receivedValue)) {
    return next(new ErrorHandler("Montants invalides fournis.", 400));
  }

  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }

  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }
  //Achat Euro : send baridimob to client , then client send da, admin send euro 
  //"euroToDinarRate": 260,
  // "dinarToEuroRate": 0.00387597,
  //amountReceived: dinars amountWillpaid: euro 
  // Validate amountPaid (EUR) vs amountReceived (DA)
  const expectedDinars = (receivedValue * param.achatDinars).toFixed(2);
  console.log(receivedValue, param.expectedDinars, expectedDinars)
  if (!areFloatsEqual(paidValue, expectedDinars)) {
    return next(new ErrorHandler("`Montant reçu ne correspond pas au taux de change actuel", 400));
  }
  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid: {
      value: paidValue,
      currency: 'DZD'
    },
    amountReceived: {
      value: receivedValue,
      currency: 'EUR'
    },
    paymentMethod: 'card',
    paymentStatus: 'confirmee',
    type,
  });

  res.status(201).json({
    success: true,
    message: "Commande Achat Dinars créée avec succès",
    commande,
  });
});

// --- Get All Commandes ---

exports.getAllCommandes = catchAsyncError(async (req, res, next) => {
  const resultPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const commandesCount = await Commande.countDocuments();

  const apiFeature = new ApiFeatures(Commande.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .pagination(resultPerPage, req.query.page);

  const commandes = await apiFeature.query;
  const filteredCount = await Commande.countDocuments(apiFeature.query.getFilter());

  res.status(200).json({
    success: true,
    commandes,
    commandesCount,
    filteredCount,
    resultPerPage,
  });
});
exports.getMyCommandes = catchAsyncError(async (req, res, next) => {
  const resultPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const commandesCount = await Commande.countDocuments({ clientId: req?.user?._id });

  const apiFeature = new ApiFeatures(Commande.find({ clientId: req?.user?._id }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .pagination(resultPerPage, req.query.page);

  const commandes = await apiFeature.query;
  const filteredCount = await Commande.countDocuments(apiFeature.query.getFilter());

  res.status(200).json({
    success: true,
    commandes,
    commandesCount,
    filteredCount,
    resultPerPage,
  });
});
// --- Get One Commande ---
exports.getCommande = catchAsyncError(async (req, res, next) => {
  let commande;
  if (req.user.role === 'client') {
    commande = await Commande.findOne({ _id: req.params.id, clientId: req.user.id }).populate('clientId');
  }
  else if (req.user.role === 'admin') {
    commande = await Commande.findOne({ _id: req.params.id }).populate('user');
  }
  else {
    return next(new ErrorHandler('Vous devez vous connecter', 401));
  }
  if (!commande) {
    return next(new ErrorHandler('Commande introuvable', 404));
  }

  res.status(200).json({
    success: true,
    commande,
  });
});

// --- Delete Commande ---
exports.deleteCommande = catchAsyncError(async (req, res, next) => {
  const commande = await Commande.findByIdAndDelete(req.params.id);

  if (!commande) {
    return next(new ErrorHandler('Commande introuvable', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Commande supprimée avec succès',
  });
});

const validateCommandeInput = (body, type) => {
  const requiredUserFields = ['nom', 'prenom', 'email', 'telephone'];
  const requiredAmountFields = ['value', 'currency'];

  const errors = [];

  for (let field of requiredUserFields) {
    if (!body.user?.[field]) {
      errors.push(`Champ requis manquant: user.${field}`);
    }
  }

  if (!body.amountPaid?.value || !body.amountPaid?.currency) {
    errors.push(`Champ requis manquant: amountPaid.value / currency`);
  }

  if (!body.amountReceived?.value || !body.amountReceived?.currency) {
    errors.push(`Champ requis manquant: amountReceived.value / currency`);
  }

  /*
    if (type === 'recharge' && !body.user.baridiMob) {
      errors.push(`Champ requis manquant: user.baridiMob pour recharge`);
    }
  */
  if (type === 'achat_euros') {
    if (!body.user.baridiMob) {
      errors.push("Champ requis manquant: BaridiMob");
    }
    if (!body.user.iban) {
      errors.push("Champ requis manquant: IBAN");
    }
  }
  if ((type === 'achat_dinars') && !body.user.baridiMob) {
    errors.push(`Champ requis manquant: BaridiMob`);
  }
  if ((type === 'recharge') && !body.user.baridiMob) {
    errors.push(`Champ requis manquant: BaridiMob`);
  }
  return errors;
};



exports.confirmCommande = catchAsyncError(async (req, res, next) => {
  let uploaded = false;

  try {
    // Attempt upload (only relevant for some types)
    await upload(req, res);
    uploaded = true;
  } catch (err) {
    const message = {
      'LIMIT_FILE_SIZE': `Pièce jointe trop grande. Limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`,
      'LIMIT_FILE_COUNT': "Veuillez envoyer uniquement un fichier.",
      'LIMIT_UNEXPECTED_FILE': err.message || "Type de fichier non autorisé."
    }[err.code] || 'Erreur lors de l’envoi de la photo.';
    return next(new ErrorHandler(message, 400));
  }

  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      if (uploaded && req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/commande');
      return next(new ErrorHandler('Commande introuvable', 404));
    }

    // 🚫 Only allow transition if already confirmed
    if (commande.paymentStatus !== 'confirmee') {
      if (uploaded && req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/commande');
      return next(new ErrorHandler('Vous ne pouvez livrer une commande que si elle est confirmée', 400));
    }

    // ✅ Handle type-specific delivery logic
    if (commande.type === 'recharge' || commande.type === 'achat_dinars') {
      if (!req.file?.filename) {
        return next(new ErrorHandler('Pièce jointe requise pour cette commande', 400));
      }
      commande.paymentReceiptUrl = req.file.filename;
    } else if (commande.type !== 'achat_euros') {
      if (uploaded && req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/commande');
      return next(new ErrorHandler('Type de commande non supporté', 400));
    }
    commande.paymentReceiptUrl = req.file.filename;

    commande.paymentStatus = 'livree';
    commande.livreeAt = Date.now();
    await commande.save();

    res.status(200).json({
      success: true,
      message: 'Commande livrée avec succès',
    });

  } catch (error) {
    console.error(error);
    if (uploaded && req.file?.filename) cleanupUploadedFile(req.file.filename, '../uploads/commande');
    return next(new ErrorHandler("Une erreur s’est produite", 400));
  }
});




exports.requestConfirmAchatEuros = catchAsyncError(async (req, res, next) => {
  try {
    await upload(req, res);
  } catch (err) {
    const message = {
      'LIMIT_FILE_SIZE': `Pièce jointe trop grande. Limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`,
      'LIMIT_FILE_COUNT': "Veuillez envoyer uniquement un fichier.",
      'LIMIT_UNEXPECTED_FILE': err.message || "Type de fichier non autorisé."
    }[err.code] || 'Erreur lors de l’envoi de la photo.';
    return next(new ErrorHandler(message, 400));
  }
  
  try {
    const commande = await Commande.findOne({ _id: req.params.id, clientId: req?.user?.id });
    if (!commande) {
      if (req.file?.filename) {
        cleanupUploadedFile(req.file.filename, '../uploads/commande');
      }
      return next(new ErrorHandler('Commande introuvable', 404));
    }
    if (commande.paymentStatus === 'livree') {
      return next(new ErrorHandler('Commande déjà livrer', 400));
    }
    if(commande.paymentStatus === 'confirmee') {
      return next(new ErrorHandler('Commande déjà confirmée', 400));
    }
    if (!req.file?.filename) {

      return next(new ErrorHandler('Pièce jointe manquante', 400));
    }
    commande.paymentStatus = 'confirmee';
    commande.paymentReceiptUrl = req.file.filename;
    commande.confirmedAt = Date.now();
    await commande.save();
    res.status(200).json({
      success: true,
      message: 'Commande confirmée avec succès',
    });
  } catch (error) {
    if (req.file?.filename) {
      cleanupUploadedFile(req.file.filename, '../uploads/commande');
    }
    return next(new ErrorHandler(error.message, 400));
  }
});

