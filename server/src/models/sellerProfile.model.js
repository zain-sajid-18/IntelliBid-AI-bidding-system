import mongoose from 'mongoose';

const sellerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bankAccountHolder: {
        type: String,
        required: true,
        trim: true
    },
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    iban: {
        type: String, // Stored encrypted
        required: true
    },
    swiftCode: {
        type: String,
        trim: true
    },
    idVerified: {
        type: Boolean,
        default: false
    },
    termsAccepted: {
        type: Boolean,
        required: true
    },
    termsAcceptedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('SellerProfile', sellerProfileSchema);
