import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressReportDoc extends Document {
  student_id: string;
  term: string;
  generated_at: Date;
  summary_data: {
    attendance_percentage: number;
    grade_average: number;
    teacher_comments: string;
    subject_grades: { subject: string; average: number }[];
  };
}

const ProgressReportSchema = new Schema<IProgressReportDoc>({
  student_id: { type: String, required: true, ref: 'StudentProfile' },
  term: { type: String, required: true },
  generated_at: { type: Date, default: Date.now },
  summary_data: {
    attendance_percentage: { type: Number, required: true },
    grade_average: { type: Number, required: true },
    teacher_comments: { type: String, default: '' },
    subject_grades: [{
      subject: { type: String, required: true },
      average: { type: Number, required: true },
    }],
  },
});

ProgressReportSchema.index({ student_id: 1, term: 1 });

export default mongoose.models.ProgressReport || mongoose.model<IProgressReportDoc>('ProgressReport', ProgressReportSchema);
