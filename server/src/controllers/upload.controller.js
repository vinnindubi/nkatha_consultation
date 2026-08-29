import { uploadToCloudinary } from '../utils/cloudinary.js';

export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Stream the file buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'nkatha-wellness');

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type, // 'image' or 'video'
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    next(error);
  }
};