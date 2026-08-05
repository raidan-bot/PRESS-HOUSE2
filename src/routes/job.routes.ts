import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/applications', authenticateToken, checkRole(['root', 'admin']), JobController.getApplications);
router.post('/applications', JobController.submitApplication);
router.put('/applications/:id', authenticateToken, checkRole(['root', 'admin']), JobController.updateApplication);

router.get('/job-applications', authenticateToken, checkRole(['root', 'admin']), JobController.getApplications);
router.post('/job-applications', JobController.submitApplication);
router.put('/job-applications/:id', authenticateToken, checkRole(['root', 'admin']), JobController.updateApplication);

router.get('/', JobController.getAll);
router.post('/', authenticateToken, checkRole(['root', 'admin']), JobController.create);
router.put('/:id', authenticateToken, checkRole(['root', 'admin']), JobController.update);
router.delete('/:id', authenticateToken, checkRole(['root', 'admin']), JobController.delete);
router.post('/', authenticateToken, checkRole(['root', 'admin']), JobController.create);
router.put('/:id', authenticateToken, checkRole(['root', 'admin']), JobController.update);
router.delete('/:id', authenticateToken, checkRole(['root', 'admin']), JobController.delete);

export default router;
