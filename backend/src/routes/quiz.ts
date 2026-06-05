import { Router, Response } from 'express';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/quiz/attempts — get all quiz attempts for the user
router.get('/attempts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempts = await QuizAttemptModel.find({ userId: req.userId })
      .sort({ date: -1 })
      .lean();

    const mapped = attempts.map((a) => ({
      id: a._id.toString(),
      date: a.date.toISOString(),
      score: a.score,
      totalQuestions: a.totalQuestions,
      correctAnswers: a.correctAnswers,
      wrongAnswers: a.wrongAnswers,
      duration: a.duration,
      topic: a.topic,
    }));

    res.json({ success: true, attempts: mapped });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// POST /api/quiz/attempts — save a new quiz attempt
router.post('/attempts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, totalQuestions, correctAnswers, wrongAnswers, duration, topic } = req.body;

    if (totalQuestions === undefined || correctAnswers === undefined) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin bài quiz.' });
      return;
    }

    const attempt = await QuizAttemptModel.create({
      userId: req.userId,
      score: score ?? Math.round((correctAnswers / totalQuestions) * 100),
      totalQuestions,
      correctAnswers,
      wrongAnswers: wrongAnswers ?? totalQuestions - correctAnswers,
      duration: duration || 0,
      topic: topic || 'Hỗn hợp',
    });

    res.status(201).json({
      success: true,
      attempt: {
        id: attempt._id.toString(),
        date: attempt.date.toISOString(),
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        duration: attempt.duration,
        topic: attempt.topic,
      },
    });
  } catch (error) {
    console.error('Create attempt error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
