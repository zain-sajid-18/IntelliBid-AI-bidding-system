import Conversation from '../../models/conversation.model.js';
import Message from '../../models/message.model.js';
import { getIO } from '../../config/socket.js';

// Get all threads for the inbox sidebar
export const getThreadsService = async (userId) => {
    const conversations = await Conversation.find({
        participants: userId,
        isArchived: false,
    })
        .sort({ updatedAt: -1 })
        .populate('participants', 'firstName lastName avatar role businessName')
        .populate('auctionRef', 'title images currentPrice')
        .lean();

    return conversations.map(conv => {
        const unread = conv.unreadCount?.[userId.toString()] || 0;
        const otherParticipant = conv.participants.find(
            p => p._id.toString() !== userId.toString()
        );
        return { ...conv, unread, otherParticipant };
    });
};

// Get paginated messages in a thread
export const getMessagesService = async (conversationId, userId, page = 1) => {
    const LIMIT = 30;
    const skip = (page - 1) * LIMIT;

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(LIMIT)
        .populate('senderId', 'firstName lastName avatar role')
        .lean();

    return messages.reverse(); // Return chronological order
};

// Send a new message
export const sendMessageService = async (senderId, senderRole, { conversationId, content, messageType = 'text', payload = null }) => {
    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId,
    });
    if (!conversation) throw new Error('Conversation not found or access denied');

    const message = await Message.create({
        conversationId,
        senderId,
        senderRole,
        content,
        messageType,
        payload,
    });

    // Update conversation lastMessage + increment unread for OTHER participants
    const otherParticipants = conversation.participants
        .filter(p => p.toString() !== senderId.toString());

    const unreadUpdate = {};
    for (const pid of otherParticipants) {
        const key = pid.toString();
        const current = conversation.unreadCount?.get(key) || 0;
        unreadUpdate[`unreadCount.${key}`] = current + 1;
    }

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { content, sentAt: new Date(), senderId },
        ...unreadUpdate,
        updatedAt: new Date(),
    });

    // Emit via Socket.io to all in the conversation room
    try {
        const io = getIO();
        const populated = await Message.findById(message._id)
            .populate('senderId', 'firstName lastName avatar role')
            .lean();
        io.to(`conv:${conversationId}`).emit('message:new', populated);
    } catch (e) {
        // Socket not critical — message is saved regardless
    }

    return message;
};

// Mark conversation as read
export const markReadService = async (conversationId, userId) => {
    await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userId}`]: 0,
    });
    await Message.updateMany(
        { conversationId, isRead: false, senderId: { $ne: userId } },
        { $set: { isRead: true, readAt: new Date() } }
    );
};

// Start or find a direct conversation with another user
export const getOrCreateDirectConversation = async (buyerId, sellerId, auctionId = null) => {
    let conv = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [buyerId, sellerId], $size: 2 },
        ...(auctionId && { auctionRef: auctionId }),
    });

    if (!conv) {
        conv = await Conversation.create({
            type: 'direct',
            participants: [buyerId, sellerId],
            auctionRef: auctionId || null,
        });
    }

    return conv;
};

// Publish a system notification to a user
export const publishNotification = async (userId, { alertType, title, body, ctaLabel, ctaHref, auctionId, auctionImage }) => {

    let sysConv = await Conversation.findOne({ type: 'system', participants: userId });
    if (!sysConv) {
        sysConv = await Conversation.create({ type: 'system', participants: [userId] });
    }

    const message = await Message.create({
        conversationId: sysConv._id,
        senderId: null,
        senderRole: 'system',
        content: title,
        messageType: 'system_alert',
        payload: { alertType, body, ctaLabel, ctaHref, auctionId, auctionImage },
    });

    await Conversation.findByIdAndUpdate(sysConv._id, {
        lastMessage: { content: title, sentAt: new Date() },
        [`unreadCount.${userId}`]: await Message.countDocuments({
            conversationId: sysConv._id,
            isRead: false,
        }),
    });

    // Push real-time notification
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit('notification:new', {
            alertType,
            title,
            body,
            ctaLabel,
            ctaHref,
            auctionImage,
        });
    } catch (e) { /* non-critical */ }

    return message;
};
