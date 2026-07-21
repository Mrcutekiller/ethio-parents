import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/lib/models/Message';
import Notification from '@/lib/models/Notification';
import { getAuthUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('thread_id');

    const query: Record<string, unknown> = {};

    if (user.role === 'admin') {
      // Admin can see all messages for oversight
    } else {
      query.$or = [
        { sender_id: user._id.toString() },
        { recipient_id: user._id.toString() },
      ];
    }

    if (threadId) {
      query.thread_id = threadId;
    }

    const messages = await Message.find(query).sort({ sent_at: -1 }).limit(100);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { recipient_id, student_context_id, body: messageBody, thread_id } = body;

    if (!recipient_id || !student_context_id || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const message = await Message.create({
      thread_id: thread_id || uuidv4(),
      sender_id: user._id.toString(),
      recipient_id,
      student_context_id,
      body: messageBody,
      sent_at: new Date(),
    });

    // Send notification
    await Notification.create({
      user_id: recipient_id,
      type: 'new_message',
      payload: { sender_name: user.name, student_context_id },
      read: false,
      sent_at: new Date(),
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Post message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { message_id } = body;

    await connectDB();
    await Message.findByIdAndUpdate(message_id, { read_at: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Patch message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
