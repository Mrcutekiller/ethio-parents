import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDoc extends Document {
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read: boolean;
  sent_at: Date;
}

const NotificationSchema = new Schema<INotificationDoc>({
  user_id: { type: String, required: true, ref: 'User' },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  sent_at: { type: Date, default: Date.now },
});

NotificationSchema.index({ user_id: 1, read: 1 });
NotificationSchema.index({ user_id: 1, sent_at: -1 });

export default mongoose.models.Notification || mongoose.model<INotificationDoc>('Notification', NotificationSchema);
