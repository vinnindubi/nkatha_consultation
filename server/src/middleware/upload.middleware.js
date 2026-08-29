import multer from 'multer';

// Use memory storage so files are kept as temporary buffers instead of saving to local disk
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to safely support video uploads
});