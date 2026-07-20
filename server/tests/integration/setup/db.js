import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function connectTestDB() {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret';
    process.env.NODE_ENV = 'test';

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
}

export async function disconnectTestDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
}

export async function clearTestDB() {
    const { collections } = mongoose.connection;
    for (const collection of Object.values(collections)) {
        await collection.deleteMany({});
    }
}
