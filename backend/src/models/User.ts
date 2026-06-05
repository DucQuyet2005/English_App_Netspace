import { Schema, model, Document } from 'mongoose';

interface ISettings {
  darkMode: boolean;
  theme: 'normal' | 'light' | 'dark';
  defaultQuizSize: number;
  dailyGoal: number;
}

export interface IUser extends Document {
  email: string;
  displayName: string;
  passwordHash: string;
  settings: ISettings;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    darkMode: { type: Boolean, default: false },
    theme: { type: String, enum: ['normal', 'light', 'dark'], default: 'normal' },
    defaultQuizSize: { type: Number, default: 10 },
    dailyGoal: { type: Number, default: 5 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    settings: { type: SettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const UserModel = model<IUser>('User', UserSchema);
