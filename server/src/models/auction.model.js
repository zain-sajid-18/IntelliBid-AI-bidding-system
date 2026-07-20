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
        enum: ['draft', 'active', 'ended', 'cancelled'],
        default: 'active'
    },
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

export default mongoose.model('Auction', auctionSchema);
