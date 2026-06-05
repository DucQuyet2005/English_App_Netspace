import { Router, Response } from 'express';
import { UserModel } from '../models/User';
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

export default router;
