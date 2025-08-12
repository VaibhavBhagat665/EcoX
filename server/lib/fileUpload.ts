/**
 * File Upload System for EcoX
 * Handles image/document uploads for carbon calculation
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per upload
  }
});

export interface ProcessedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    hasExif?: boolean;
  };
}

/**
 * Process uploaded file and generate metadata
 */
export async function processUploadedFile(file: Express.Multer.File, userId: string): Promise<ProcessedFile> {
  const fileId = uuidv4();
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const fileUrl = `${baseUrl}/uploads/${file.filename}`;
  
  const processedFile: ProcessedFile = {
    id: fileId,
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url: fileUrl
  };

  // Process images with Sharp
  if (file.mimetype.startsWith('image/')) {
    try {
      const imagePath = file.path;
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      processedFile.metadata = {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasExif: !!metadata.exif
      };

      // Generate thumbnail
      const thumbnailPath = path.join(uploadDir, `thumb_${file.filename}`);
      await image
        .resize(300, 300, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      processedFile.thumbnail = `${baseUrl}/uploads/thumb_${file.filename}`;
      
    } catch (error) {
      console.error('Image processing failed:', error);
    }
  }

  return processedFile;
}

/**
 * Extract text from uploaded documents (OCR placeholder)
 */
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  // This would integrate with OCR services like Tesseract, Google Vision API, etc.
  // For now, return placeholder text based on file type
  
  if (mimeType.startsWith('image/')) {
    return `[OCR would extract text from image: ${path.basename(filePath)}]`;
  } else if (mimeType === 'application/pdf') {
    return `[PDF text extraction would happen here for: ${path.basename(filePath)}]`;
  } else if (mimeType.includes('csv') || mimeType.includes('spreadsheet')) {
    return `[CSV/Excel data extraction would happen here for: ${path.basename(filePath)}]`;
  }
  
  return '';
}

/**
 * Validate file for carbon calculation
 */
export function validateCarbonFile(file: Express.Multer.File): { valid: boolean; message?: string } {
  // Check if file is suitable for carbon calculation
  const carbonFileTypes = [
    'image/jpeg', 'image/jpg', 'image/png', // For bill/receipt images
    'application/pdf', // For PDF bills
    'text/csv', // For energy data
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!carbonFileTypes.includes(file.mimetype)) {
    return {
      valid: false,
      message: 'File type not supported for carbon calculation. Please upload images, PDFs, or CSV files.'
    };
  }

  // Check file size (smaller limit for efficient processing)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File too large. Please upload files smaller than 5MB.'
    };
  }

  return { valid: true };
}

/**
 * Clean up old uploaded files
 */
export async function cleanupOldFiles(olderThanDays = 30): Promise<void> {
  try {
    const files = fs.readdirSync(uploadDir);
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtimeMs < cutoffTime) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('File cleanup failed:', error);
  }
}

/**
 * Get file upload statistics
 */
export function getUploadStats(): {
  totalFiles: number;
  totalSize: number;
  diskUsage: string;
} {
  try {
    const files = fs.readdirSync(uploadDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    return {
      totalFiles: files.length,
      totalSize,
      diskUsage: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    return {
      totalFiles: 0,
      totalSize: 0,
      diskUsage: '0 MB'
    };
  }
}

// Initialize cleanup job (run once per day)
setInterval(() => {
  cleanupOldFiles(30);
}, 24 * 60 * 60 * 1000);

export default {
  upload,
  processUploadedFile,
  extractTextFromFile,
  validateCarbonFile,
  cleanupOldFiles,
  getUploadStats
};
