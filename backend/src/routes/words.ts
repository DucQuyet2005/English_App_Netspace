import { Router, Response } from "express";
import { WordModel } from "../models/Word";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Vietnamese part of speech mapping
const partOfSpeechVi: { [key: string]: string } = {
  noun: "danh từ",
  verb: "động từ",
  adjective: "tính từ",
  adverb: "trạng từ",
  preposition: "giới từ",
  pronoun: "đại từ",
  conjunction: "liên từ",
  interjection: "thán từ",
  abbreviation: "viết tắt",
  prefix: "tiền tố",
  suffix: "hậu tố",
};

function getPartOfSpeechVi(pos: string): string {
  const cleanPos = pos.toLowerCase().trim();
  return partOfSpeechVi[cleanPos] || cleanPos;
}

// Google Translate helper function
async function translateToVietnamese(text: string): Promise<string> {
  if (!text || text.trim() === "") return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "LingoFlow/1.0" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return text;
    const data = (await res.json()) as any[];
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0]
        .map((x: any) => (x && x[0] ? x[0] : ""))
        .join("")
        .trim()
        .normalize("NFC");
    }
    return text;
  } catch (err) {
    console.error("Translate to Vietnamese error:", err);
    return text;
  }
}

// Google Translate word details translator helper (for simple POS-grouped translations)
async function getWordTranslation(word: string): Promise<string> {
  if (!word || word.trim() === "") return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=at&dt=rm&dt=ss&q=${encodeURIComponent(word)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "LingoFlow/1.0" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as any[];
    
    // Parse main translation
    let mainTrans = "";
    if (data[0] && data[0][0] && data[0][0][0]) {
      mainTrans = data[0][0][0].trim().normalize("NFC");
    }
    
    // Parse detailed POS translations
    let posMeanings: string[] = [];
    if (data[1] && Array.isArray(data[1])) {
      for (const posGroup of data[1]) {
        const pos = posGroup[0]; // e.g. "noun"
        const posVi = getPartOfSpeechVi(pos);
        const transList = posGroup[1]; // e.g. ["khí hậu", "thời tiết"]
        if (transList && transList.length > 0) {
          const cleanTrans = transList
            .slice(0, 3)
            .map((t: string) => t.trim().normalize("NFC"))
            .join(", ");
          posMeanings.push(`(${posVi}) ${cleanTrans}`);
        }
      }
    }
    
    if (posMeanings.length > 0) {
      return posMeanings.join("; ");
    }
    return mainTrans;
  } catch (err) {
    console.error("Translate word error:", err);
    return "";
  }
}

// All routes require authentication
router.use(authMiddleware);

// GET /api/words/lookup?word=xxx — lookup word definition (for Chrome Extension)
// Tra nghĩa từ qua Free Dictionary API và dịch sang Tiếng Việt đơn giản theo từ loại
router.get("/lookup", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word } = req.query;

    if (!word || typeof word !== "string" || word.trim().length === 0) {
      res.status(400).json({ success: false, message: "Thiếu tham số 'word'." });
      return;
    }

    const cleanWord = word.trim().toLowerCase();

    // 1. Dịch từ để lấy nghĩa tiếng Việt đơn giản & nhiều loại từ
    let meaning = await getWordTranslation(cleanWord);

    // 2. Gọi Free Dictionary API để lấy IPA và Example
    let ipa = "";
    let example = "";
    let englishMeaning = "";
    let partOfSpeech = "";

    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
        {
          headers: { "User-Agent": "LingoFlow/1.0" },
          signal: AbortSignal.timeout(4000),
        }
      );

      if (dictRes.ok) {
        const data = (await dictRes.json()) as any[];
        const entry = data[0];
        ipa = entry?.phonetic || entry?.phonetics?.find((p: any) => p.text)?.text || "";
        const firstMeaning = entry?.meanings?.[0];
        const firstDef = firstMeaning?.definitions?.[0];
        partOfSpeech = firstMeaning?.partOfSpeech || "";
        englishMeaning = firstDef?.definition || "";
        example = firstDef?.example || "";
      }
    } catch (err) {
      console.warn("Free Dictionary lookup timed out or failed, using translation only.");
    }

    // 3. Fallback: Nếu không lấy được nghĩa từ dịch từ, dùng định nghĩa tiếng Anh từ từ điển và dịch nó
    if (!meaning && englishMeaning) {
      const translatedMeaning = await translateToVietnamese(englishMeaning);
      const posVi = getPartOfSpeechVi(partOfSpeech);
      meaning = posVi ? `(${posVi}) ${translatedMeaning}` : translatedMeaning;
    }

    res.json({
      success: meaning !== "",
      word: cleanWord,
      ipa,
      meaning,
      example,
      notFound: meaning === "",
    });
  } catch (error: any) {
    // Timeout hoặc mạng lỗi - trả về rỗng để extension tự xử lý
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      res.json({ success: true, word: req.query.word, ipa: "", meaning: "", example: "" });
      return;
    }
    console.error("Word lookup error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tra nghĩa." });
  }
});


router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, topic, learned, sort } = req.query;
    const filter: any = { userId: req.userId };

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filter.$or = [{ word: searchRegex }, { meaning: searchRegex }];
    }

    if (topic) {
      filter.topic = topic;
    }

    if (learned !== undefined && learned !== "") {
      filter.learned = learned === "true";
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "word") sortOption = { word: 1 };
    else if (sort === "learned") sortOption = { learned: -1, createdAt: -1 };
    else if (sort === "box") sortOption = { box: 1 };

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
    console.error("Get words error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// POST /api/words — create a new word
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, ipa, meaning, example, topic, learned } = req.body;

    if (!word || !meaning) {
      res
        .status(400)
        .json({ success: false, message: "Từ vựng và nghĩa là bắt buộc." });
      return;
    }

    const newWord = await WordModel.create({
      userId: req.userId,
      word: word.trim(),
      ipa: ipa?.trim() || "",
      meaning: meaning.trim(),
      example: example?.trim() || "",
      topic: topic?.trim() || "Chung",
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
    console.error("Create word error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// PUT /api/words/:id — update a word
router.put("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, ipa, meaning, example, topic, learned, box, nextReviewDate } =
      req.body;

    const existing = await WordModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!existing) {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy từ vựng." });
      return;
    }

    if (word !== undefined) existing.word = word.trim();
    if (ipa !== undefined) existing.ipa = ipa.trim();
    if (meaning !== undefined) existing.meaning = meaning.trim();
    if (example !== undefined) existing.example = example.trim();
    if (topic !== undefined) existing.topic = topic.trim();
    if (learned !== undefined) existing.learned = learned;
    if (box !== undefined) existing.box = box;
    if (nextReviewDate !== undefined)
      existing.nextReviewDate = new Date(nextReviewDate);

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
    console.error("Update word error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// PATCH /api/words/:id — partial update for a word, including explicit learned state with Leitner logic
router.patch("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { word, ipa, meaning, example, topic, learned, box, nextReviewDate } =
      req.body;

    const existing = await WordModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!existing) {
      res
        .status(404)
        .json({ success: false, message: "Không tìm thấy từ vựng." });
      return;
    }

    if (word !== undefined) existing.word = word.trim();
    if (ipa !== undefined) existing.ipa = ipa.trim();
    if (meaning !== undefined) existing.meaning = meaning.trim();
    if (example !== undefined) existing.example = example.trim();
    if (topic !== undefined) existing.topic = topic.trim();

    if (typeof learned === "boolean") {
      existing.learned = learned;
      if (learned) {
        existing.box = Math.min(5, existing.box + 1);
        const nextReview = new Date();
        nextReview.setDate(
          nextReview.getDate() + Math.pow(2, existing.box - 1),
        );
        existing.nextReviewDate = nextReview;
      } else {
        existing.box = 1;
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);
        existing.nextReviewDate = nextReview;
      }
    }

    if (box !== undefined) existing.box = box;
    if (nextReviewDate !== undefined)
      existing.nextReviewDate = new Date(nextReviewDate);

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
    console.error("Patch word error:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// PATCH /api/words/:id/learned — toggle learned status with Leitner logic
router.patch(
  "/:id/learned",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const existing = await WordModel.findOne({
        _id: req.params.id,
        userId: req.userId,
      });
      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy từ vựng." });
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
      console.error("Toggle learned error:", error);
      res.status(500).json({ success: false, message: "Lỗi server." });
    }
  },
);

// PATCH /api/words/:id/set-learned — set learned status directly (not toggle)
// Used by Flashcard "Đã nhớ"/"Chưa nhớ" buttons to set a definitive state
router.patch(
  "/:id/set-learned",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { learned } = req.body;
      if (typeof learned !== "boolean") {
        res
          .status(400)
          .json({
            success: false,
            message: 'Trường "learned" phải là boolean.',
          });
        return;
      }

      const existing = await WordModel.findOne({
        _id: req.params.id,
        userId: req.userId,
      });
      if (!existing) {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy từ vựng." });
        return;
      }

      let nextBox = existing.box;
      let nextReviewDays = 1;

      if (learned) {
        // Nhớ: nâng hộp (tối đa Hộp 5)
        nextBox = Math.min(5, existing.box + 1);
        nextReviewDays = Math.pow(2, nextBox - 1);
      } else {
        // Quên: đặt lại Hộp 1, ôn lại ngày mai
        nextBox = 1;
        nextReviewDays = 1;
      }

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays);

      existing.learned = learned;
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
      console.error("Set learned error:", error);
      res.status(500).json({ success: false, message: "Lỗi server." });
    }
  },
);

// DELETE /api/words/:id — delete a word
router.delete(
  "/:id",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await WordModel.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });
      if (!result) {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy từ vựng." });
        return;
      }

      res.json({ success: true, message: "Đã xóa từ vựng thành công." });
    } catch (error) {
      console.error("Delete word error:", error);
      res.status(500).json({ success: false, message: "Lỗi server." });
    }
  },
);

export default router;
