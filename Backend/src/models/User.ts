import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  tagline: string;
  theme: 'Dark' | 'Light';
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    tagline: { type: String, default: 'Discipline is my fuel.' },
    theme: { type: String, enum: ['Dark', 'Light'], default: 'Dark' }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
