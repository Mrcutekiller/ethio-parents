import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttemptDoc extends Document {
  test_id: string;
  student_id: string;
  answers: { question_index: number; answer: string }[];
  score: number;
  max_score: number;
  violations: { type: string; timestamp: Date }[];
  started_at: Date;
  submitted_at?: Date;
  auto_submitted: boolean;
}

const QuizAttemptSchema = new Schema<IQuizAttemptDoc>({
  test_id: { type: String, required: true, ref: 'Assignment' },
  student_id: { type: String, required: true, ref: 'StudentProfile' },
  answers: [{
    question_index: { type: Number, required: true },
    answer: { type: String, required: true },
  }],
  score: { type: Number, default: 0 },
  max_score: { type: Number, required: true },
  violations: [{
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  started_at: { type: Date, default: Date.now },
  submitted_at: { type: Date },
  auto_submitted: { type: Boolean, default: false },
});

QuizAttemptSchema.index({ test_id: 1, student_id: 1 });

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttemptDoc>('QuizAttempt', QuizAttemptSchema);
