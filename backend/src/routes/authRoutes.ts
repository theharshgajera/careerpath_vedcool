import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Questionnaire from '../models/QuestionnaireModel';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';
import { spawn } from 'child_process';
import path from 'path';

const router: express.Router = express.Router();

// Helper function to handle async routes
const asyncHandler = (fn: (req: Request | AuthRequest, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request | AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Protected /students endpoint
router.get('/students', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const students = await User.find({}).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching student data' });
  }
}));

// Unprotected /students-test endpoint
router.get('/students-test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const students = await User.find({}).select('-password');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching student data' });
  }
}));

// New endpoint to fetch questionnaire data
router.get('/questionnaire-data', asyncHandler(async (req: Request, res: Response) => {
  try {
    const questionnaireData = await Questionnaire.find({}).populate('userId', 'firstName lastName email schoolName standard age status');
    res.json(questionnaireData);
  } catch (error) {
    console.error('Error fetching questionnaire data:', error);
    res.status(500).json({ message: 'Error fetching questionnaire data' });
  }
}));

// Endpoint to fetch report status for the logged-in user
router.get('/report-status', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.userId).select('status reportPath');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      status: user.status,
      reportPath: user.reportPath || null
    });
  } catch (error) {
    console.error('Error fetching report status:', error);
    res.status(500).json({ message: 'Error fetching report status' });
  }
}));

// Download report endpoint
router.get('/download-report/:reportPath', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { reportPath } = req.params;
    if (!reportPath || reportPath.includes('..')) {
      return res.status(400).json({ message: 'Invalid report path' });
    }
    const reportsDir = path.join(__dirname, '../../career-ai-service/reportss');
    const filePath = path.join(reportsDir, reportPath);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({ message: 'Report not found or error in download' });
      }
    });
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ message: 'Error downloading report' });
  }
}));

router.post('/analyze', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const answers = req.body.answers;
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../career-ai-service/server.py'),
      JSON.stringify({
        answers,
        studentInfo: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          school: user.schoolName,
          grade: user.standard,
          age: user.age,
          interests: user.interests
        }
      })
    ]);
    let result = '';
    let errorOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Career analysis failed',
          details: errorOutput
        });
      }
      try {
        const analysis = JSON.parse(result);
        res.json(analysis);
      } catch (e) {
        res.status(500).json({
          error: 'Invalid analysis response',
          details: result
        });
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('Signup request body:', req.body);
    const academicInfo = `${req.body.standard}th Grade - ${req.body.academicPerformance || 'Not specified'}`;
    const user = new User({
      ...req.body,
      password: req.body.password,
      academicInfo: academicInfo,
      studentName: `${req.body.firstName} ${req.body.lastName}`
    });
    await user.save();
    console.log('User created:', user);
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        interests: user.interests
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Signup failed', details: errorMessage });
  }
}));

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        interests: user.interests
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
}));

router.get('/profile', verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
}));

export default router;