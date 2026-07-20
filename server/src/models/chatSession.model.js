import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    history: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true
            },
            parts: [{
                text: { type: String, required: true }
            }],
            timestamp: { type: Date, default: Date.now },
        },
    ],
    contextVersion: { type: Number, default: 0 },
}, { timestamps: true });

// Keep history lean — only store last 40 turns (20 exchanges)
chatSessionSchema.pre('save', function (next) {
    if (this.history.length > 40) {
        this.history = this.history.slice(-40);
    }
    next();
});

export default mongoose.model('ChatSession', chatSessionSchema);
