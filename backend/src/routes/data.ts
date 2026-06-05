import { Router, Response } from 'express';
import { WordModel } from '../models/Word';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { UserModel } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET /api/data/export — export all user data as JSON
router.get('/export', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId).select('-passwordHash');
    const words = await WordModel.find({ userId: req.userId }).lean();
    const attempts = await QuizAttemptModel.find({ userId: req.userId }).sort({ date: -1 }).lean();

    const exportData = {
      app: 'LingoFlow_English',
      exportDate: new Date().toISOString(),
      user: user ? { id: user._id, email: user.email, displayName: user.displayName } : null,
      settings: user?.settings,
      words: words.map((w) => ({
        id: w._id.toString(),
        word: w.word,
        ipa: w.ipa,
        meaning: w.meaning,
        example: w.example,
        topic: w.topic,
        learned: w.learned,
        box: w.box,
        nextReviewDate: w.nextReviewDate.toISOString(),
        createdAt: w.createdAt.toISOString(),
      })),
      attempts: attempts.map((a) => ({
        id: a._id.toString(),
        date: a.date.toISOString(),
        score: a.score,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers,
        wrongAnswers: a.wrongAnswers,
        duration: a.duration,
        topic: a.topic,
      })),
    };

    res.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// POST /api/data/import — import data from JSON
router.post('/import', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { words, attempts, settings } = req.body;

    if (!Array.isArray(words)) {
      res.status(400).json({ success: false, message: 'Dữ liệu không đúng định dạng.' });
      return;
    }

    // Clear existing data
    await WordModel.deleteMany({ userId: req.userId });
    await QuizAttemptModel.deleteMany({ userId: req.userId });

    // Import words
    if (words.length > 0) {
      const wordDocs = words.map((w: any) => ({
        userId: req.userId,
        word: w.word,
        ipa: w.ipa || '',
        meaning: w.meaning,
        example: w.example || '',
        topic: w.topic || 'Chung',
        learned: w.learned || false,
        box: w.box || 1,
        nextReviewDate: w.nextReviewDate ? new Date(w.nextReviewDate) : new Date(),
        createdAt: w.createdAt ? new Date(w.createdAt) : new Date(),
      }));
      await WordModel.insertMany(wordDocs);
    }

    // Import attempts
    if (Array.isArray(attempts) && attempts.length > 0) {
      const attemptDocs = attempts.map((a: any) => ({
        userId: req.userId,
        score: a.score,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers,
        wrongAnswers: a.wrongAnswers,
        duration: a.duration || 0,
        topic: a.topic || 'Hỗn hợp',
        date: a.date ? new Date(a.date) : new Date(),
      }));
      await QuizAttemptModel.insertMany(attemptDocs);
    }

    // Import settings
    if (settings) {
      const user = await UserModel.findById(req.userId);
      if (user) {
        if (settings.darkMode !== undefined) user.settings.darkMode = settings.darkMode;
        if (settings.theme !== undefined) user.settings.theme = settings.theme;
        if (settings.defaultQuizSize !== undefined) user.settings.defaultQuizSize = settings.defaultQuizSize;
        if (settings.dailyGoal !== undefined) user.settings.dailyGoal = settings.dailyGoal;
        await user.save();
      }
    }

    res.json({ success: true, message: 'Khôi phục dữ liệu học tập thành công!' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// DELETE /api/data/reset — reset all user data to defaults
router.delete('/reset', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await WordModel.deleteMany({ userId: req.userId });
    await QuizAttemptModel.deleteMany({ userId: req.userId });

    // Reset settings
    const user = await UserModel.findById(req.userId);
    if (user) {
      user.settings.darkMode = false;
      user.settings.theme = 'normal';
      user.settings.defaultQuizSize = 10;
      user.settings.dailyGoal = 5;
      await user.save();
    }

    // Re-seed words
    const SEED_WORDS = [
      { word: 'Mother', ipa: '/ˈmʌðər/', meaning: 'Mẹ, người mẹ', example: 'Every mother wants the best for her children.', topic: 'Gia đình', learned: true, box: 3 },
      { word: 'Father', ipa: '/ˈfɑːðər/', meaning: 'Bố, cha, tía', example: 'He looks up to his father as a role model.', topic: 'Gia đình', learned: true, box: 3 },
      { word: 'Brother', ipa: '/ˈbrʌðər/', meaning: 'Anh trai, em trai', example: 'My elder brother is currently studying in Japan.', topic: 'Gia đình', learned: false, box: 1 },
    ];
    const seedWordsWithUser = SEED_WORDS.map((w) => ({
      ...w,
      userId: req.userId,
      nextReviewDate: w.learned ? new Date(Date.now() + Math.pow(2, w.box - 1) * 86400000) : new Date(),
    }));
    await WordModel.insertMany(seedWordsWithUser);

    res.json({ success: true, message: 'Đã khôi phục dữ liệu về trạng thái mặc định.' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
