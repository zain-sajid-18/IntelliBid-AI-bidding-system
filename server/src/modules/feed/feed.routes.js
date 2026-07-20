import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { getFeed } from './feed.controller.js';

const router = express.Router();

router.get('/', auth, getFeed);

export default router;
