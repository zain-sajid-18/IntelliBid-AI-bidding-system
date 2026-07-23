import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { limiter } from './middleware/rateLimiter.js'
import authRoutes from './modules/auth/auth.routes.js';
import buyerRoutes from './modules/buyer/buyer.routes.js';
import sellerRoutes from './modules/seller/seller.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import feedRoutes from './modules/feed/feed.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import auctionRoutes from './modules/auction/auction.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import liveBiddingRoutes from './modules/live-bidding/live-bidding.routes.js';

import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// security middleware
app.use(helmet({
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS configuration with automatic trailing slash removal
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const corsOrigin = clientUrl.endsWith('/') ? clientUrl.slice(0, -1) : clientUrl;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(limiter);

// body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/live-bidding', liveBiddingRoutes);


// Error Handler
app.use(errorHandler);

export default app;


