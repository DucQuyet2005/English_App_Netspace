import { Router, Response } from 'express';
import { WordModel } from '../models/Word';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/words — list words with optional filters
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, topic, learned, sort } = req.query;
    const filter: any = { userId: req.userId };

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [{ word: searchRegex }, { meaning: searchRegex }];
    }

    if (topic) {
      filter.topic = topic;
    }

    if (learned !== undefined && learned !== '') {
      filter.learned = learned === 'true';
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'word') sortOption = { word: 1 };
    else if (sort === 'learned') sortOption = { learned: -1, createdAt: -1 };
    else if (sort === 'box') sortOption = { box: 1 };

    const words = await WordModel.find(filter).sort(sortOption).lean();

    // Map _id to id for frontend compatibility
    const mapped = words.map((w) => ({
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
    }));

    res.json({ success: true, words: mapped });
  } catch (error) {
    console.error('Get words error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// POST /api/words — create a new word
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, ipa, meaning, example, topic, learned } = req.body;

    if (!word || !meaning) {
      res.status(400).json({ success: false, message: 'Từ vựng và nghĩa là bắt buộc.' });
      return;
    }

    const newWord = await WordModel.create({
      userId: req.userId,
      word: word.trim(),
      ipa: ipa?.trim() || '',
      meaning: meaning.trim(),
      example: example?.trim() || '',
      topic: topic?.trim() || 'Chung',
      learned: learned || false,
      box: 1,
      nextReviewDate: new Date(),
    });

    res.status(201).json({
      success: true,
      word: {
        id: newWord._id.toString(),
        word: newWord.word,
        ipa: newWord.ipa,
        meaning: newWord.meaning,
        example: newWord.example,
        topic: newWord.topic,
        learned: newWord.learned,
        box: newWord.box,
        nextReviewDate: newWord.nextReviewDate.toISOString(),
        createdAt: newWord.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create word error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// PUT /api/words/:id — update a word
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, ipa, meaning, example, topic, learned, box, nextReviewDate } = req.body;

    const existing = await WordModel.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng.' });
      return;
    }

    if (word !== undefined) existing.word = word.trim();
    if (ipa !== undefined) existing.ipa = ipa.trim();
    if (meaning !== undefined) existing.meaning = meaning.trim();
    if (example !== undefined) existing.example = example.trim();
    if (topic !== undefined) existing.topic = topic.trim();
    if (learned !== undefined) existing.learned = learned;
    if (box !== undefined) existing.box = box;
    if (nextReviewDate !== undefined) existing.nextReviewDate = new Date(nextReviewDate);

    await existing.save();

    res.json({
      success: true,
      word: {
        id: existing._id.toString(),
        word: existing.word,
        ipa: existing.ipa,
        meaning: existing.meaning,
        example: existing.example,
        topic: existing.topic,
        learned: existing.learned,
        box: existing.box,
        nextReviewDate: existing.nextReviewDate.toISOString(),
        createdAt: existing.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update word error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// PATCH /api/words/:id/learned — toggle learned status with Leitner logic
router.patch('/:id/learned', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await WordModel.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng.' });
      return;
    }

    const nextLearned = !existing.learned;
    let nextBox = existing.box;
    let nextReviewDays = 1;

    if (nextLearned) {
      nextBox = Math.min(5, existing.box + 1);
      nextReviewDays = Math.pow(2, nextBox - 1);
    } else {
      nextBox = 1;
      nextReviewDays = 0;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

    existing.learned = nextLearned;
    existing.box = nextBox;
    existing.nextReviewDate = nextReviewDate;
    await existing.save();

    res.json({
      success: true,
      word: {
        id: existing._id.toString(),
        word: existing.word,
        ipa: existing.ipa,
        meaning: existing.meaning,
        example: existing.example,
        topic: existing.topic,
        learned: existing.learned,
        box: existing.box,
        nextReviewDate: existing.nextReviewDate.toISOString(),
        createdAt: existing.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Toggle learned error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// DELETE /api/words/:id — delete a word
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await WordModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!result) {
      res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng.' });
      return;
    }

    res.json({ success: true, message: 'Đã xóa từ vựng thành công.' });
  } catch (error) {
    console.error('Delete word error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
