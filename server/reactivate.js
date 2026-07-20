import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in env variables.');
    process.exit(1);
}

// Define inline Schema to avoid import complexities
const UserSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'active'
    }
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected successfully.');

        console.log('Reactivating all suspended/banned users...');
        const result = await User.updateMany(
            { status: { $in: ['suspended', 'banned'] } },
            { $set: { status: 'active' } }
        );

        console.log(`✅ Update complete! Reactivated ${result.modifiedCount} user accounts.`);
    } catch (err) {
        console.error('❌ Error during reactivation:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

run();
