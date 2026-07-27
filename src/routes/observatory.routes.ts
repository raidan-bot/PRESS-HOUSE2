import { Router } from 'express';
import { ObservatoryController } from '../controllers/observatory.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.get('/', ObservatoryController.getAllViolations);
router.post('/', upload.single('file'), ObservatoryController.submitViolation);
router.get('/violations', ObservatoryController.getAllViolations); // Keep for compatibility if needed
router.post('/violations', upload.single('file'), ObservatoryController.submitViolation); // Keep for compatibility if needed
router.post('/jpt/case-draft', authenticateToken, ObservatoryController.getCaseDraft);

export default router;
