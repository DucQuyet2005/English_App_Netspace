import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { WordModel } from '../models/Word';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Seed data for new users
const SEED_WORDS = [
  { word: 'Mother', ipa: '/ˈmʌðər/', meaning: 'Mẹ, người mẹ', example: 'Every mother wants the best for her children.', topic: 'Gia đình', learned: true, box: 3 },
  { word: 'Father', ipa: '/ˈfɑːðər/', meaning: 'Bố, cha, tía', example: 'He looks up to his father as a role model.', topic: 'Gia đình', learned: true, box: 3 },
  { word: 'Brother', ipa: '/ˈbrʌðər/', meaning: 'Anh trai, em trai', example: 'My elder brother is currently studying in Japan.', topic: 'Gia đình', learned: false, box: 1 },
  { word: 'Sister', ipa: '/ˈsɪstər/', meaning: 'Chị gái, em gái', example: 'She shares a very close bond with her younger sister.', topic: 'Gia đình', learned: false, box: 1 },
  { word: 'Grandmother', ipa: '/ˈɡræn.mʌð.ər/', meaning: 'Bà (nội hoặc ngoại)', example: 'My grandmother cooks the most delicious traditional meals.', topic: 'Gia đình', learned: true, box: 2 },
  { word: 'Grandfather', ipa: '/ˈɡræn.fɑː.ðər/', meaning: 'Ông (nội hoặc ngoại)', example: 'Our grandfather enjoys reading newspapers in the garden.', topic: 'Gia đình', learned: false, box: 1 },
  { word: 'Resilience', ipa: '/rɪˈzɪl.jəns/', meaning: 'Sự kiên cường, khả năng phục hồi', example: 'She showed great resilience in overcoming her illness.', topic: 'IELTS', learned: true, box: 3 },
  { word: 'Itinerary', ipa: '/aɪˈtɪn.ə.rer.i/', meaning: 'Hành trình, lịch trình chuyến đi', example: 'We must plan our itinerary carefully before traveling to Sa Pa.', topic: 'Du lịch', learned: false, box: 1 },
  { word: 'Collaborate', ipa: '/kəˈlæb.ə.reɪt/', meaning: 'Cộng tác, hợp tác làm việc', example: 'Researchers from various universities collaborate on this project.', topic: 'Công việc', learned: false, box: 1 },
];

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu hợp lệ.' });
      return;
    }

    const existingUser = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email đã được sử dụng. Vui lòng thử email khác.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      email: email.trim().toLowerCase(),
      displayName: displayName?.trim() || email.split('@')[0],
      passwordHash,
    });

    // Seed initial words for the new user
    const seedWordsWithUser = SEED_WORDS.map((w) => ({
      ...w,
      userId: user._id,
      nextReviewDate: w.learned ? new Date(Date.now() + Math.pow(2, w.box - 1) * 86400000) : new Date(),
    }));
    await WordModel.insertMany(seedWordsWithUser);

    const token = generateToken((user._id as any).toString());

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Chào mừng đến với LingoFlow!',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại sau.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
      return;
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Email chưa được đăng ký. Vui lòng đăng ký trước.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' });
      return;
    }

    const token = generateToken((user._id as any).toString());

    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server. Vui lòng thử lại sau.' });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById(req.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
