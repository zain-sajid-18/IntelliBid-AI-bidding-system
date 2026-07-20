import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    startingDate: {
        type: Date,
        default: Date.now
    },
    endingDate: {
        type: Date,
        required: true
    },
    mainImage: {
        type: String,
        required: true
    },
    image2: {
        type: String
    },
    image3: {
        type: String
    },
    image4: {
        type: String
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

productSchema.index({ endingDate: 1 });

export default mongoose.model("Product", productSchema);