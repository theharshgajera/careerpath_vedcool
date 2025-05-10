import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(__dirname, '../../Uploads/Resources');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only PDF, DOC, DOCX, TXT, JPG, JPEG, and PNG files are allowed') as any);
    }
  }
});

// Upload report for a specific student (only requires authentication)
router.post(
  '/upload-report/:userId',
  verifyToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded or invalid file type' });
        return;
      }

      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: 'Invalid user ID' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'Student not found' });
        return;
      }

      user.reportPath = req.file.filename;
      user.status = 'Report Generated';
      user.reportUploadedAt = new Date(); // Set the upload timestamp
      user.updatedAt = new Date();
      await user.save();

      res.status(200).json({
        message: 'Report uploaded successfully',
        report: {
          fileName: req.file.originalname,
          filePath: req.file.filename,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Report upload error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
    }
  }
);

// Download file (restrict to student's own report)
router.get('/download/:filePath', verifyToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const filePath = path.join(__dirname, '../../Uploads/Resources', req.params.filePath);
    const user = await User.findById(req.user.userId);

    if (!user || (user.reportPath !== req.params.filePath)) {
      res.status(403).json({ message: 'You are not authorized to access this file' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
    next(error);
  }
});

export default router;