import mongoose from 'mongoose';

const EVENT_WEIGHTS = {
    bid_placed: 10,
    outbid_rebid: 9,
    auction_won: 10,
    watchlist_add: 7,
    share_item: 6,
    search_query: 5,
    category_browse: 4,
    item_view: 3,
    time_on_page: 2,
    auction_lost: -2,
    account_suspended: 0,
};

const userEventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auction',
            default: null,
        },

        // Generic event type.
        // Any valid lowercase snake_case event can be stored.
        eventType: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: /^[a-z0-9_]+$/,
        },

        // Recommendation/behavior score.
        // Known events get their configured weight.
        // Unknown events automatically receive 0.
        weight: {
            type: Number,
            default: undefined,
        },

        context: {
            type: String,
            default: null,
        },

        category: {
            type: String,
        },

        tags: [
            {
                type: String,
            },
        ],

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        createdAt: {
            type: Date,
            default: Date.now,
            index: {
                expireAfterSeconds: 2592000, // 30 days
            },
        },
    },
    {
        timestamps: false,
    }
);

// Automatically assign a weight based on the event type.
// Unknown event types are allowed and receive a neutral weight of 0.
userEventSchema.pre('validate', function (next) {
    if (this.weight === undefined || this.weight === null) {
        this.weight = EVENT_WEIGHTS[this.eventType] ?? 0;
    }

    next();
});

userEventSchema.index({
    userId: 1,
    createdAt: -1,
});

userEventSchema.index({
    auctionId: 1,
});

export { EVENT_WEIGHTS };

export default mongoose.model('UserEvent', userEventSchema);