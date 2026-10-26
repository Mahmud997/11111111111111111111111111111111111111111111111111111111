import { Router } from 'express';
import { getPublicInvitation, submitRsvp } from '../controllers/publicController';

const router = Router();

router.get('/i/:slug', getPublicInvitation);
router.post('/i/:slug/rsvp', submitRsvp);

export default router;
