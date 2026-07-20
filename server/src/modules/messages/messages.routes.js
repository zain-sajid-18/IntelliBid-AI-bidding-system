import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import {
    getThreads,
    getMessages,
    sendMessage,
    markRead,
    startConversation,
} from './messages.controller.js';
import { chat, getHistory, clearHistory } from './ai/ai.controller.js';

const router = express.Router();

router.use(auth);

// Inbox threads
router.get('/threads', getThreads);
router.post('/conversations/start', startConversation);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);
router.patch('/:conversationId/read', markRead);

// BidMind AI
router.post('/ai/chat', chat);
router.get('/ai/history', getHistory);
router.delete('/ai/history', clearHistory);

export default router;
