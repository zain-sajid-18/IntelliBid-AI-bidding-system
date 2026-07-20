import { asyncHandler } from '../../utils/asyncHandler.js';
import {
    getThreadsService,
    getMessagesService,
    sendMessageService,
    markReadService,
    getOrCreateDirectConversation,
} from './messages.service.js';

export const getThreads = asyncHandler(async (req, res) => {
    const threads = await getThreadsService(req.user.id);
    res.status(200).json({ success: true, threads });
});

export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { page } = req.query;
    const messages = await getMessagesService(conversationId, req.user.id, Number(page) || 1);
    res.status(200).json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, content, messageType, payload } = req.body;
    if (!conversationId || !content) {
        return res.status(400).json({ success: false, message: 'conversationId and content are required' });
    }
    const msg = await sendMessageService(req.user.id, req.user.role, {
        conversationId, content, messageType, payload
    });
    res.status(201).json({ success: true, message: msg });
});

export const markRead = asyncHandler(async (req, res) => {
    await markReadService(req.params.conversationId, req.user.id);
    res.status(200).json({ success: true });
});

export const startConversation = asyncHandler(async (req, res) => {
    const { sellerId, auctionId } = req.body;
    if (!sellerId) {
        return res.status(400).json({ success: false, message: 'sellerId is required' });
    }
    const conversation = await getOrCreateDirectConversation(req.user.id, sellerId, auctionId);
    res.status(200).json({ success: true, conversation });
});
