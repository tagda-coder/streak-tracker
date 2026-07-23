import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  userId: Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  reminderEnabled: boolean;
  reminderTime: string;
  startDate: string;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    reminderEnabled: { type: Boolean, default: false },
    reminderTime: { type: String, default: '09:00' },
    // YYYY-MM-DD; the day the category becomes visible/trackable. Defaults to creation day.
    startDate: { type: String }
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);