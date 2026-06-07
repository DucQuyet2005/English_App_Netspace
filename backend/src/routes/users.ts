import { Router, Response } from 'express';
import { UserModel } from '../models/User';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// PUT /api/users/settings — update user settings
router.put('/settings', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { darkMode, theme, defaultQuizSize, dailyGoal } = req.body;

    const user = await UserModel.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    if (theme !== undefined) user.settings.theme = theme;
    if (defaultQuizSize !== undefined) user.settings.defaultQuizSize = defaultQuizSize;
    if (dailyGoal !== undefined) user.settings.dailyGoal = dailyGoal;

    await user.save();

    res.json({
      success: true,
      settings: user.settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// GET /api/users/leaderboard - Get weekly leaderboard
router.get('/leaderboard', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const leaderboardData = await QuizAttemptModel.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalCorrect: { $sum: '$correctAnswers' },
          totalDuration: { $sum: '$duration' },
          quizCount: { $sum: 1 }
        }
      },
      {
        $sort: {
          totalCorrect: -1,
          totalDuration: 1,
          quizCount: 1
        }
      },
      {
        $limit: 10
      }
    ]);

    const populatedLeaderboard = await Promise.all(
      leaderboardData.map(async (item, index) => {
        const user = await UserModel.findById(item._id).select('displayName email');
        return {
          rank: index + 1,
          userId: item._id,
          displayName: user ? user.displayName : 'Người dùng',
          score: item.totalCorrect,
          duration: item.totalDuration,
          quizCount: item.quizCount,
          isCurrentUser: item._id.toString() === req.userId
        };
      })
    );

    res.json({ success: true, leaderboard: populatedLeaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
