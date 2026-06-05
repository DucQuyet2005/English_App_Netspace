import { Schema, model, Document, Types } from 'mongoose';

export interface IWord extends Document {
  userId: Types.ObjectId;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  topic: string;
  learned: boolean;
  box: number;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WordSchema = new Schema<IWord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    word: { type: String, required: true, trim: true },
    ipa: { type: String, trim: true, default: '' },
    meaning: { type: String, required: true, trim: true },
    example: { type: String, trim: true, default: '' },
    topic: { type: String, required: true, trim: true, default: 'Chung' },
    learned: { type: Boolean, default: false },
    box: { type: Number, min: 1, max: 5, default: 1 },
    nextReviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

WordSchema.index({ userId: 1, word: 1 });
WordSchema.index({ userId: 1, nextReviewDate: 1 });
WordSchema.index({ userId: 1, topic: 1, learned: 1 });

export const WordModel = model<IWord>('Word', WordSchema);
