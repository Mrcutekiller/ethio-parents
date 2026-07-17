import mongoose, { Schema, Document } from 'mongoose';

export interface IGradeDoc extends Document {
  student_id: string;
  subject_id: string;
  term: string;
  assignment_name: string;
  score: number;
  max_score: number;
  posted_by: string;
  posted_at: Date;
}

const GradeSchema = new Schema<IGradeDoc>({
  student_id: { type: String, required: true, ref: 'StudentProfile' },
  subject_id: { type: String, required: true, ref: 'Subject' },
  term: { type: String, required: true },
  assignment_name: { type: String, required: true },
  score: { type: Number, required: true },
  max_score: { type: Number, required: true },
  posted_by: { type: String, required: true, ref: 'User' },
  posted_at: { type: Date, default: Date.now },
});

GradeSchema.index({ student_id: 1, subject_id: 1 });
GradeSchema.index({ student_id: 1, term: 1 });

export default mongoose.models.Grade || mongoose.model<IGradeDoc>('Grade', GradeSchema);
