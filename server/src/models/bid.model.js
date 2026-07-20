import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        auction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction'
        },
        bidder:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', required: true
        },
        amount: {
            type: Number, required:
                true, min: 0
        },
        isAutoBid: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['winning', 'outbid', 'won'],
            default: 'winning'
        }
    }, { timestamps: true });


bidSchema.index({ product: 1, bidder: 1 });
bidSchema.index({ auction: 1, amount: -1 }); // Auction leaderboard
bidSchema.index({ bidder: 1, status: 1, createdAt: -1 }); // My Bids list

export default mongoose.model('Bid', bidSchema);
