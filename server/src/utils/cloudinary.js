import {v2 as cloudinary} from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
    cloud_name :process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret :process.env.CLOUDINARY_API_SECRET
});
/**
 * Uploads a file buffer to Cloudinary using a stream
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} folder - The folder name in Cloudinary (e.g. 'nkatha-wellness')
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadToCloudinary = (fileBuffer, folder = 'nkatha-wellness') => {
  return new Promise((resolve, reject) => {
    console.log('Starting Cloudinary upload stream for folder:', folder);
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Automatically detects if it's an image or video
        folder: folder,
      },
      (error, result) => {
        if (error) {
            console.error('Cloudinary stream inner error:', error); // <--- Add this
            return reject(error);
        }
        console.log('Cloudinary upload success! Public URL:', result.secure_url); // <--- Add this
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};