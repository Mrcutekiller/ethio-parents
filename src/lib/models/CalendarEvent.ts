import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEventDoc extends Document {
  scope: 'school' | 'class' | 'personal';
  scope_id?: string;
  title: string;
  description?: string;
  date: Date;
  end_date?: Date;
  created_by: string;
}

const CalendarEventSchema = new Schema<ICalendarEventDoc>({
  scope: { type: String, enum: ['school', 'class', 'personal'], required: true },
  scope_id: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  end_date: { type: Date },
  created_by: { type: String, required: true, ref: 'User' },
});

CalendarEventSchema.index({ scope: 1, scope_id: 1, date: 1 });
CalendarEventSchema.index({ date: 1 });

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEventDoc>('CalendarEvent', CalendarEventSchema);
