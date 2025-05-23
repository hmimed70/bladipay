const Parametre = require('../models/ParameterModel');

const Commande = require('../models/commandeModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const ApiFeatures = require('../utils/Features');
const { generateUniqueTrackingCode } = require('../utils/helpers');

// Helper: Validate required fields based on type


// --- Create Controllers ---
exports.createRecharge = catchAsyncError(async (req, res, next) => {
  const type = 'recharge';
  const { user, amountPaid, amountReceived, paymentMethod } = req.body;

  const errors = validateCommandeInput(req.body, type);
  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }

  // Load conversion rates from Parametre
  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }

  // Verify conversion (DZD → EUR)
  const expectedMap = {
    500: 2.99,
    750: 3.99,
    1000: 4.95,
    1500: 7.99,
    2000: 9.99,
  };

  const expectedEuro = expectedMap[amountPaid.value];
  if (!expectedEuro || expectedEuro !== parseFloat(amountReceived.value)) {
    return next(new ErrorHandler('Montant incohérent avec les paramètres de recharge.', 400));
  }

  req.body.type = type;
  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid,
    amountReceived,
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
  const { user, amountPaid, amountReceived, paymentMethod } = req.body;

  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }

  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }

  // Validate amountPaid (EUR) vs amountReceived (DA)
  const expectedDA = amountPaid.value * param.achat_euros_rate;
  if (parseInt(amountReceived.value) !== parseInt(expectedDA)) {
    return next(new ErrorHandler(`Montant reçu ne correspond pas au taux de change actuel: ${param.achat_euros_rate}`, 400));
  }

  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid,
    amountReceived,
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

  if (errors.length > 0) {
    return next(new ErrorHandler(errors.join(', '), 400));
  }

  const param = await Parametre.findOne();
  if (!param) {
    return next(new ErrorHandler('Paramètres non définis.', 500));
  }

  // Validate amountPaid (DA) vs amountReceived (EUR)
  const expectedDA = amountReceived.value * param.achat_dinars_rate;
  if (parseInt(amountPaid.value) !== parseInt(expectedDA)) {
    return next(new ErrorHandler(`Montant payé ne correspond pas au taux de change actuel: ${param.achat_dinars_rate}`, 400));
  }

  // Optional: check daily limit logic here using aggregate

  const trackingCode = await generateUniqueTrackingCode();

  const commande = await Commande.create({
    user,
    trackingCode,
    clientId: req?.user?.id,
    amountPaid,
    amountReceived,
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

// --- Get One Commande ---
exports.getCommande = catchAsyncError(async (req, res, next) => {
    let commande;
    if(req.user.role === 'client') {
        commande = await Commande.findOne({ _id: req.params.id, clientId: req.user.id }).populate('clientId');
    }
    else if(req.user.role === 'admin') {
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

  if (!body.paymentMethod) {
    errors.push(`Champ requis manquant: paymentMethod`);
  }
/*
  if (type === 'recharge' && !body.user.baridiMob) {
    errors.push(`Champ requis manquant: user.baridiMob pour recharge`);
  }
*/
  if ((type === 'achat_euros' || type === 'achat_dinars') && !body.user.iban) {
    errors.push(`Champ requis manquant: IBAN `);
  }
    if ((type === 'achat_euros' || type === 'achat_dinars') && !body.user.baridiMob ) {
    errors.push(`Champ requis manquant: BaridiMob ou RIP`);
  }
  return errors;
};