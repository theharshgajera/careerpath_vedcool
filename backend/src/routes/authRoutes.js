"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const QuestionnaireModel_1 = __importDefault(require("../models/QuestionnaireModel"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Helper function to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Protected /students endpoint
router.get('/students', authMiddleware_1.verifyToken, asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const students = await User_1.default.find({}).select('-password');
        res.json(students);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching student data' });
    }
}));
// Unprotected /students-test endpoint
router.get('/students-test', asyncHandler(async (req, res) => {
    try {
        const students = await User_1.default.find({}).select('-password');
        res.json(students);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching student data' });
    }
}));
// New endpoint to fetch questionnaire data
router.get('/questionnaire-data', asyncHandler(async (req, res) => {
    try {
        const questionnaireData = await QuestionnaireModel_1.default.find({}).populate('userId', 'firstName lastName email schoolName standard age status');
        res.json(questionnaireData);
    }
    catch (error) {
        console.error('Error fetching questionnaire data:', error);
        res.status(500).json({ message: 'Error fetching questionnaire data' });
    }
}));
// Endpoint to fetch report status for the logged-in user
router.get('/report-status', authMiddleware_1.verifyToken, asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await User_1.default.findById(req.user.userId).select('status reportPath');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            status: user.status,
            reportPath: user.reportPath || null
        });
    }
    catch (error) {
        console.error('Error fetching report status:', error);
        res.status(500).json({ message: 'Error fetching report status' });
    }
}));
// Download report endpoint
router.get('/download-report/:reportPath', authMiddleware_1.verifyToken, asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { reportPath } = req.params;
        if (!reportPath || reportPath.includes('..')) {
            return res.status(400).json({ message: 'Invalid report path' });
        }
        const reportsDir = path_1.default.join(__dirname, '../../career-ai-service/reportss');
        const filePath = path_1.default.join(reportsDir, reportPath);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(404).json({ message: 'Report not found or error in download' });
            }
        });
    }
    catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ message: 'Error downloading report' });
    }
}));
router.post('/analyze', authMiddleware_1.verifyToken, asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const answers = req.body.answers;
        const pythonProcess = (0, child_process_1.spawn)('python', [
            path_1.default.join(__dirname, '../../career-ai-service/server.py'),
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
            }
            catch (e) {
                res.status(500).json({
                    error: 'Invalid analysis response',
                    details: result
                });
            }
        });
    }
    catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
router.post('/signup', asyncHandler(async (req, res) => {
    try {
        console.log('Signup request body:', req.body);
        const academicInfo = `${req.body.standard}th Grade - ${req.body.academicPerformance || 'Not specified'}`;
        const user = new User_1.default({
            ...req.body,
            password: req.body.password,
            academicInfo: academicInfo,
            studentName: `${req.body.firstName} ${req.body.lastName}`
        });
        await user.save();
        console.log('User created:', user);
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Signup error:', error);
        const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
        res.status(500).json({ error: 'Signup failed', details: errorMessage });
    }
}));
router.post('/login', asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
}));
router.get('/profile', authMiddleware_1.verifyToken, asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await User_1.default.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
}));
exports.default = router;
