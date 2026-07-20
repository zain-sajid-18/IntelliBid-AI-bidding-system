import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let io;

export const initSocket = (httpServer) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const corsOrigin = clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl;

    io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            credentials: true,
        },
    });

    // Auth middleware for sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
                ?.split(';')
                .find(c => c.trim().startsWith('token='))
                ?.split('=')[1];

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('_id firstName role');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        console.log(`[Socket] Connected: ${socket.user.firstName} (${userId})`);

        // Join personal room for notifications
        socket.join(`user:${userId}`);

        // ── Conversation rooms ────────────────────────────────────────────────
        socket.on('join:conversation', (conversationId) => {
            socket.join(`conv:${conversationId}`);
        });

        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conv:${conversationId}`);
        });

        // ── Auction rooms (live bid updates) ──────────────────────────────────
        socket.on('join:auction', (auctionId) => {
            socket.join(`auction:${auctionId}`);
        });

        socket.on('leave:auction', (auctionId) => {
            socket.leave(`auction:${auctionId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.user.firstName}`);
        });
    });

    console.log('[Socket] Socket.io initialized');
    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

// Broadcast a new bid to all watchers of an auction + notify outbid user
export const broadcastBid = ({ auctionId, newPrice, bidCount, bidderId, bidderName, outbidUserId }) => {
    if (!io) return;
    // Update all viewers of the auction
    io.to(`auction:${auctionId}`).emit('bid:new', {
        auctionId,
        newPrice,
        bidCount,
        bidderId,
        bidderName,
        timestamp: new Date().toISOString(),
    });
    // Notify the outbid user personally
    if (outbidUserId) {
        io.to(`user:${outbidUserId}`).emit('notification:new', {
            type: 'outbid',
            title: "You've been outbid!",
            body: `Someone placed a higher bid. Current price: $${newPrice.toLocaleString()}`,
            auctionId,
            timestamp: new Date().toISOString(),
        });
    }
};

