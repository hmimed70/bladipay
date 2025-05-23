const multer = require('multer');
const path = require('path');

// Types MIME autorisés
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// Extensions autorisées
const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.doc', '.docx'];

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);
  const extension = path.extname(file.originalname).toLowerCase();
  const isExtensionAllowed = allowedExtensions.includes(extension);

  if (isMimeTypeAllowed && isExtensionAllowed) {
    cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
    error.message = 'Seuls les fichiers images, PDF ou Word sont autorisés.';
    cb(error);
  }
};

// Export du middleware multer
exports.upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5 Mo
  },
  fileFilter,
});
