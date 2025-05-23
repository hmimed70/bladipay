const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/Storage'); // middleware for file upload
const { isAdmin, isAuthenticated, isUser } = require('../middlewares/auth');
const { getSupportDetails, getMySupports, deleteSupport, createSupportTicket, getAllSupports } = require('../controllers/SupportController');

router.post('/', isAuthenticated, isUser, createSupportTicket);

// Optional: Get all tickets (admin or user’s own)
router.get('/my_supports',isAuthenticated, isUser, getMySupports)
router.get('/', isAuthenticated, isAdmin,  getAllSupports)
.get('/:id', isAuthenticated, isUser, getSupportDetails)
.delete('/:id', isAuthenticated, isAdmin, deleteSupport);

module.exports = router;
