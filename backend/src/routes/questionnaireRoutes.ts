import express, { Request, Response } from 'express';
import { verifyToken } from '../middleware/authMiddleware';
import Questionnaire from '../models/QuestionnaireModel';
import User from '../models/User';
import AssessmentManager from '../utils/AssessmentManager';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

const router = express.Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
  Promise.resolve(fn(req, res)).catch((error) => {
    console.error('Route error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  });
};

// Save progress
router.post('/save-progress', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { currentQuestion, answers } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let questionnaire = await Questionnaire.findOne({ userId });
    if (!questionnaire) {
      questionnaire = new Questionnaire({
        userId,
        studentName: `${user.firstName} ${user.lastName}`,
        age: user.age || '',
        academicInfo: `${user.standard} Grade`,
        interests: user.interests || '',
        answers: {},
        currentQuestion: 0,
        completed: false
      });
    }

    questionnaire.currentQuestion = currentQuestion;
    questionnaire.answers = answers;
    await questionnaire.save();

    return res.status(200).json({ message: 'Progress saved' });
  } catch (error) {
    console.error('Progress save error:', error);
    return res.status(500).json({
      message: 'Failed to save progress',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Submit answers
router.post('/submit-answers', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let questionnaire = await Questionnaire.findOne({ userId });
    if (!questionnaire) {
      return res.status(400).json({ message: 'No questionnaire found' });
    }

    if (questionnaire.completed) {
      return res.status(400).json({ message: 'Questionnaire already submitted' });
    }

    // Transform answers
    const transformedAnswers = req.body.answers.reduce((acc: Record<string, any>, curr: any) => {
      acc[curr.questionId] = curr.answer;
      return acc;
    }, {});

    // Calculate trait scores locally
    const assessmentManager = new AssessmentManager();
    const skillScores = assessmentManager.calculateScores(transformedAnswers);

    // Update questionnaire
    questionnaire.answers = transformedAnswers;
    questionnaire.skillScores = skillScores;
    questionnaire.completed = true;
    await questionnaire.save();

    // Update user status to Analyzing
    await User.findByIdAndUpdate(userId, { status: 'Analyzing' });

    return res.status(200).json({ message: 'Answers submitted successfully' });

  } catch (error) {
    console.error('Submission error:', error);
    await User.findByIdAndUpdate(userId, { status: 'Error' });
    return res.status(500).json({
      message: 'Failed to process submission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Get questionnaire data
router.get('/get-answers', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let questionnaire = await Questionnaire.findOne({ userId });
    if (!questionnaire) {
      // Initialize questionnaire for new user
      questionnaire = new Questionnaire({
        userId,
        studentName: `${user.firstName} ${user.lastName}`,
        age: user.age || '',
        academicInfo: `${user.standard} Grade`,
        interests: user.interests || '',
        answers: {},
        currentQuestion: 0,
        completed: false
      });
      await questionnaire.save();
    }

    return res.status(200).json({
      answers: questionnaire.answers,
      currentQuestion: questionnaire.currentQuestion,
      completed: questionnaire.completed
    });
  } catch (error) {
    console.error('Questionnaire fetch error:', error);
    return res.status(500).json({
      message: 'Failed to fetch questionnaire',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

router.get('/report-status', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      status: user.status || 'Pending',
      reportPath: user.reportPath || null
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    return res.status(500).json({
      message: 'Failed to fetch report status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));
export default router;