import { Router } from 'express';
import { MembershipController } from '../controllers/membership.controller';
import { authenticateToken, checkRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/membership-tiers', MembershipController.getTiers);
router.get('/tiers', MembershipController.getTiers);
router.get('/user-memberships', authenticateToken, checkRole(['root', 'admin']), MembershipController.getAllUserMemberships);
router.get('/user-memberships/me', authenticateToken, MembershipController.getMyMembership);
router.post('/user-memberships', authenticateToken, MembershipController.createUserMembership);
router.put('/user-memberships/:id/status', authenticateToken, checkRole(['root', 'admin']), MembershipController.updateStatus);

export default router;
