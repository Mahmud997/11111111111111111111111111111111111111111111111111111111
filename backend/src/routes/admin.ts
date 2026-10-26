import { Router } from 'express';
import {
  createAsset,
  listAssets,
  createTemplate,
  updateTemplate,
  listTemplates,
  getTemplate,
  createInvitation,
  publishInvitation,
} from '../controllers/adminController';

const router = Router();

// Assets
router.post('/assets', createAsset);
router.get('/assets', listAssets);

// Templates
router.post('/templates', createTemplate);
router.get('/templates', listTemplates);
router.get('/templates/:id', getTemplate);
router.put('/templates/:id', updateTemplate);

// Invitations
router.post('/invitations', createInvitation);
router.put('/invitations/:id/publish', publishInvitation);

export default router;
