import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const query: Record<string, unknown> = { user_id: user._id.toString() };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query).sort({ sent_at: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user_id: user._id.toString(), read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { notification_id, mark_all } = body;

    await connectDB();

    if (mark_all) {
      await Notification.updateMany(
        { user_id: user._id.toString(), read: false },
        { read: true }
      );
    } else if (notification_id) {
      await Notification.findByIdAndUpdate(notification_id, { read: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Patch notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
