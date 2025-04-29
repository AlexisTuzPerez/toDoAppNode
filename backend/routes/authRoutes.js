const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/authenticate', authController.authenticate);
router.get('/verifyAuth', authMiddleware, authController.verifyAuth);
router.post('/logout', authController.logout);

module.exports = router;
