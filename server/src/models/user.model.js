import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'admin'],
        default: 'buyer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }],

    // Profile Fields
    bio: {
        type: String,
        maxLength: 500
    },
    phone: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    avatar: {
        type: String
    },
    businessName: {
        type: String,
        trim: true
    },
    businessCategory: {
        type: String,
        trim: true
    },
    // For sellers
    website: {
        type: String,
        trim: true
    },

    // Seller Specific
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    sellerActivatedAt: Date,
    sellerStatus: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: null
    },
    stripeConnectedAccountId: String,

    // Wallet / Funds
    walletBalance: {
        type: Number,
        default: 0
    },

    // Settings
    notificationsEnabled: {
        type: Boolean,
        default: true
    },
    profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    // Account Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'banned'],
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);