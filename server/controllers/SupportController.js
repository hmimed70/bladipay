const Support = require('../models/SupportModel');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/errorHandler');
const ApiFeatures = require('../utils/Features');

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5 Mo

const uploadDir = path.join(__dirname, '../uploads/support');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Créer le dossier s'il n'existe pas
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif/;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(ext);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    error.message = 'Seuls les fichiers PDF, Word et les images sont autorisés!';
    cb(error);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE,
    files: 1
  },

  fileFilter,
}).single('image');

const cleanupUploadedFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads/support', filename);
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Erreur lors de la suppression du fichier : ${filePath}`, err);
  });
};

// Contrôleur
exports.createSupportTicket = catchAsyncError(async (req, res, next) => {
  upload(req, res, async (err) => {
    // Gestion des erreurs Multer
    if (err) {
      let message;
      switch (err.code) {
        case 'LIMIT_PART_COUNT':
          message = 'Trop de parties dans la requête.';
          break;
        case 'LIMIT_FILE_SIZE':
          message = `Pièce jointe trop grande. Limite de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`;
          break;
        case 'LIMIT_FILE_COUNT':
          message = "s'il vous plait, envoyez uniquement un fichier.";
          break;
        case 'LIMIT_FIELD_KEY':
        case 'LIMIT_FIELD_VALUE':
        case 'LIMIT_FIELD_COUNT':
          message = 'Le formulaire contient des champs non valides ou trop longs.';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message = "s'il vous plait, envoyez uniquement un fichier.";
        default:
          message = err.message || 'Erreur lors de l’envoi du fichier.';
      }
      return next(new ErrorHandler(message, 400));
    }

    const { type, description } = req.body;

    // Validation des champs
    if (!type || !description) {
      if (req.file?.filename) {
        cleanupUploadedFile(req.file.filename);
      }
      return next(new ErrorHandler('Le type et la description sont requis.', 400));
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
        cleanupUploadedFile(req.file.filename);
      }
      return next(new ErrorHandler('Erreur lors de la création du ticket.', 500));
    }
  });
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
    cleanupUploadedFile(support.image);
  }

  // Supprime le document de la base de données
  await Support.findByIdAndDelete(req?.params?.id);

  res.status(200).json({
    success: true,
    message: 'Support supprimé avec succès',
  });
});
