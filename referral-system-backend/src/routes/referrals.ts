import { Router } from 'express';
import { authenticate } from '../middleware/auth';  
import {
  createReferral,
  getReferrals,
  updateReferralStatus
} from '../controllers/referralController';

const router = Router();

router.post('/', authenticate, createReferral);                
router.get('/', authenticate, getReferrals);                   
router.patch('/:id/status', authenticate, updateReferralStatus); 

export default router;