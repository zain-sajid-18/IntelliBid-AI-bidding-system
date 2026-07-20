import { asyncHandler } from '../../../utils/asyncHandler.js';
import { chatWithAI, getAiHistoryService, clearAiHistoryService } from './ai.service.js';

export const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const result = await chatWithAI(req.user.id, message.trim());
    res.status(200).json({ success: true, ...result });
});

export const getHistory = asyncHandler(async (req, res) => {
    const history = await getAiHistoryService(req.user.id);
    res.status(200).json({ success: true, history });
});

export const clearHistory = asyncHandler(async (req, res) => {
    await clearAiHistoryService(req.user.id);
    res.status(200).json({ success: true, message: 'Chat history cleared' });
});
