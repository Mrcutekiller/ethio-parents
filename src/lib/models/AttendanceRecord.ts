import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecordDoc extends Document {
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  createdAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecordDoc>({
  student_id: { type: String, required: true, ref: 'StudentProfile' },
  class_id: { type: String, required: true, ref: 'Class' },
  date: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  marked_by: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

AttendanceRecordSchema.index({ student_id: 1, date: 1 }, { unique: true });
AttendanceRecordSchema.index({ class_id: 1, date: 1 });
AttendanceRecordSchema.index({ student_id: 1 });

export default mongoose.models.AttendanceRecord || mongoose.model<IAttendanceRecordDoc>('AttendanceRecord', AttendanceRecordSchema);
