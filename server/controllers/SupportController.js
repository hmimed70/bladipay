const Support = require('../models/SupportModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const ApiFeatures = require('../utils/Features');
const util = require('util');

const MAX_FILE_SIZE = 5 * 1024 * 1024;


const {  cleanupUploadedFile, createUploader} = require('../utils/UploadHelper');

// Custom uploader for user avatars
const upload = util.promisify(
  createUploader({
    directory: '../uploads/support',
    maxFileSize: 5 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    fieldName: 'image'
  })
);



const allowedTypeSupport = [
    'Problème de Recharge',
    'Problème de Paiement',
    'Retard de commande',
    'Demande de Remboursement',
    'Modification de Commande',
    'problème de Compte',
    'Suggestions',
    'Autre'
  ]


// Contrôleur
exports.createSupportTicket = catchAsyncError(async (req, res, next) => {

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

    const { type, description } = req.body;

    // Validation des champs
    if (!type || !description) {
      if (req.file?.filename) {
        cleanupUploadedFile(req.file.filename, '../uploads/support');
      }
      return next(new ErrorHandler('Le type et la description sont requis.', 400));
    }

    if(!allowedTypeSupport.includes(type)) {
      if (req.file?.filename) {
        cleanupUploadedFile(req.file.filename, '../uploads/support');
      }
      return next(new ErrorHandler("S'il vous plait donner le type de support", 400));
    }
    try {
      const supportTicket = await Support.create({
        type,
        description,
        clientId: req.user?._id,
        image: req.file?.filename || null,
      });

      res.status(201).json({ success: true, supportTicket });

    } catch (dbError) {
      if (req.file?.filename) {
        cleanupUploadedFile(req.file.filename, '../uploads/support');
      }
      console.error(dbError);
      return next(new ErrorHandler('Erreur lors de la création du ticket.', 500));
    }
  
});

exports.getMySupports = catchAsyncError(async (req, res, next) => {

  const resultPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  // Get the total number of orders
  const supportsCount = await Support.countDocuments({ clientId: req?.user?._id });

  const apiFeature = new ApiFeatures(Support.find({ clientId: req?.user?._id }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .pagination(resultPerPage, req.query.page);
  const filteredSupportsCount = await Support.find(apiFeature.query.getFilter()).countDocuments();

  // Execute the query to get the orders
  const supports = await apiFeature.query;

  res.status(200).json({
    success: true,
    supports,
    supportsCount, // Total orders count without filter
    filteredSupportsCount, // Total filtered orders count
    resultPerPage,
  });
})

exports.getAllSupports = catchAsyncError(async (req, res, next) => {

  const resultPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  // Get the total number of orders
  const supportsCount = await Support.countDocuments();

  const apiFeature = new ApiFeatures(Support.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .pagination(resultPerPage, req.query.page);
  const filteredSupportsCount = await Support.find(apiFeature.query.getFilter()).countDocuments();

  // Execute the query to get the orders
  const supports = await apiFeature.query;

  res.status(200).json({
    success: true,
    supports,
    supportsCount, // Total orders count without filter
    filteredSupportsCount, // Total filtered orders count
    resultPerPage,
  });
})

exports.getSupportDetails = catchAsyncError(async (req, res, next) => {
  let support;

  if (req?.user?.role === 'admin') {
    support = await Support.findById(req.params.id).populate('clientId');
  } else if (req?.user?.role === 'client') {
    support = await Support.findOne({
      _id: req.params.id,
      clientId: req.user._id,
    }).populate('clientId');
  }

  if (!support) return next(new ErrorHandler('Support introuvable', 404));

  res.status(200).json({ success: true, support });
});



exports.deleteSupport = catchAsyncError(async (req, res, next) => {
  const support = await Support.findById(req?.params?.id);

  if (!support) {
    return next(new ErrorHandler('Support introuvable', 404));
  }

  if (support?.image) {
    cleanupUploadedFile(support.image, '../uploads/support');
  }

  // Supprime le document de la base de données
  await Support.findByIdAndDelete(req?.params?.id);

  res.status(200).json({
    success: true,
    message: 'Support supprimé avec succès',
  });
});
