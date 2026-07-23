import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    startingPrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, default: function () { return this.startingPrice; } },
    reservePrice: { type: Number, min: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['draft', 'active', 'ended', 'cancelled', 'scheduled', 'live', 'awaiting_seller_confirmation', 'sale_confirmed', 'sale_rejected'],
        default: 'active'
    },
    type: {
        type: String,
        enum: ['standard', 'live'],
        default: 'standard'
    },
    scheduledStartTime: { type: Date },
    maxParticipants: { type: Number, default: 5, min: 2, max: 10 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bidCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    bidVersion: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }]
}, { timestamps: true });

// Index for faster queries
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ bidVersion: 1 });
auctionSchema.index({ title: 'text', description: 'text', tags: 'text' });
auctionSchema.index({ type: 1, status: 1 });

export default mongoose.model('Auction', auctionSchema);
