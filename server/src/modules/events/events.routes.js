import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { trackEvent } from './events.controller.js';

const router = express.Router();

router.post('/track', auth, trackEvent);

export default router;
