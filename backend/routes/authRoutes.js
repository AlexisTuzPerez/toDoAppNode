const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/authenticate', authController.authenticate);
router.get('/verifyAuth', authMiddleware, authController.verifyAuth);
router.post('/logout', authController.logout);
router.get('/user', authMiddleware, authController.getUserProfile);
router.put('/user', authMiddleware, authController.updateUser);
router.delete('/user', authMiddleware, authController.deleteUser);

module.exports = router;
