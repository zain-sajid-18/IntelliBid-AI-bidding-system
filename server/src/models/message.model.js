import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderRole: {
        type: String,
        enum: ['buyer', 'seller', 'system', 'ai'],
        required: true,
    },
    content: { type: String, required: true },
    messageType: {
        type: String,
        enum: ['text', 'offer', 'system_alert', 'auction_ref', 'ai_response'],
        default: 'text',
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
