const fs = require('fs');
const path = require('path');
const multer = require('multer');

exports.createUploader = ({
    directory = '../uploads',
    maxFileSize = 5 * 1024 * 1024,
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'],
    fieldName = 'file'
}) => {
    const uploadDir = path.join(__dirname, directory);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
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

    const allowedTypes = new RegExp(allowedExtensions.join('|'), 'i');

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(ext);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
            error.message = `Seuls les fichiers ${allowedExtensions.join(', ')} sont autorisés!`;
            cb(error);
        }
    };

    return multer({
        storage,
        limits: { fileSize: maxFileSize, files: 1 },
        fileFilter
    }).single(fieldName);
};

exports.cleanupUploadedFile = (filename, directory = '../uploads') => {
    if (!filename) return;
    const filePath = path.join(__dirname, directory, filename);
    fs.unlink(filePath, (err) => {
        if (err) console.error(`Erreur lors de la suppression du fichier : ${filePath}`, err);
    });
};
