import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Safe configuration diagnostics
console.log('[Cloudinary] Configuration check:', {
cloudName: process.env.CLOUDINARY_CLOUD_NAME
? 'Present'
: 'MISSING',
apiKey: process.env.CLOUDINARY_API_KEY
? 'Present'
: 'MISSING',
apiSecret: process.env.CLOUDINARY_API_SECRET
? 'Present'
: 'MISSING',
});

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
secure: true, // Always use secure URLs
});

// Optional safe Cloudinary connectivity test.
// This verifies credentials without exposing the API secret.
cloudinary.api.ping()
.then((result) => {
console.log('[Cloudinary] Connection successful:', result.status);
})
.catch((error) => {
console.error('[Cloudinary] Connection test failed:', {
status: error.http_code,
message: error.message,
name: error.name,
});
});

// ── Avatar uploads ────────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
cloudinary,
params: {
folder: 'intellibid_avatars',
transformation: [
{
width: 500,
height: 500,
crop: 'limit',
},
],
},
});

export const upload = multer({
storage: avatarStorage,
});

// ── Auction image uploads ─────────────────────────────────────────────────────
const auctionImageStorage = new CloudinaryStorage({
cloudinary,
params: {
folder: 'intellibid_auctions',
transformation: [
{
width: 1200,
height: 1200,
crop: 'limit',
quality: 'auto',
},
],
},
});

export const uploadAuctionImages = multer({
storage: auctionImageStorage,
limits: {
fileSize: 8 * 1024 * 1024,
},
fileFilter: (req, file, cb) => {
const allowed = [
'image/jpeg',
'image/png',
'image/webp',
'image/jpg',
];

if (allowed.includes(file.mimetype)) {
  cb(null, true);
} else {
  cb(
    new Error('Only JPEG, PNG, and WebP images are allowed'),
    false
  );
}

},
});

export default cloudinary;
