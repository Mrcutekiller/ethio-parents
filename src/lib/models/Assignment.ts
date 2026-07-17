import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignmentDoc extends Document {
  subject_id: string;
  teacher_id: string;
  type: 'assignment' | 'test' | 'quiz';
  title: string;
  description: string;
  due_date: Date;
  questions: {
    type: 'multiple_choice' | 'short_answer';
    question: string;
    options?: string[];
    correct_answer: string;
    points: number;
  }[];
  time_limit_minutes?: number;
  max_score: number;
  randomized: boolean;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignmentDoc>({
  subject_id: { type: String, required: true, ref: 'Subject' },
  teacher_id: { type: String, required: true, ref: 'User' },
  type: { type: String, enum: ['assignment', 'test', 'quiz'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  due_date: { type: Date, required: true },
  questions: [{
    type: { type: String, enum: ['multiple_choice', 'short_answer'], required: true },
    question: { type: String, required: true },
    options: [String],
    correct_answer: { type: String, required: true },
    points: { type: Number, required: true },
  }],
  time_limit_minutes: { type: Number },
  max_score: { type: Number, required: true },
  randomized: { type: Boolean, default: false },
}, { timestamps: true });

AssignmentSchema.index({ subject_id: 1 });
AssignmentSchema.index({ teacher_id: 1 });

export default mongoose.models.Assignment || mongoose.model<IAssignmentDoc>('Assignment', AssignmentSchema);
