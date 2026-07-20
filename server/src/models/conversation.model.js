import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'system', 'ai'],
        required: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    auctionRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        default: null
    },
    lastMessage: {
        content: {
            type: String,
            default: ''
        },
        sentAt: { type: Date },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', default: null
        },
    },
    unreadCount: {
        type: Map, of: Number,
        default: {}
    },
    isArchived: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ type: 1 });

export default mongoose.model('Conversation', conversationSchema);
