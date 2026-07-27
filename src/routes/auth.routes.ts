import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// OAuth Endpoints (Phase 2.2 / Phase 5)
router.get('/google/url', AuthController.googleUrl);
router.get('/google/callback', AuthController.googleCallback);
router.get('/linkedin/url', AuthController.linkedinUrl);
router.get('/linkedin/callback', AuthController.linkedinCallback);

router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);

export default router;
