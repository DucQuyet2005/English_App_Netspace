import { Schema, model, Document, Types } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: Types.ObjectId;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  duration: number;
  topic: string;
  date: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  totalQuestions: { type: Number, required: true, min: 1 },
  correctAnswers: { type: Number, required: true, min: 0 },
  wrongAnswers: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true },
  topic: { type: String, required: true, default: 'Hỗn hợp' },
  date: { type: Date, default: Date.now },
});

QuizAttemptSchema.index({ userId: 1, date: -1 });

export const QuizAttemptModel = model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
