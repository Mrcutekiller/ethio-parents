import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CalendarEvent from '@/lib/models/CalendarEvent';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const scopeId = searchParams.get('scope_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query: Record<string, unknown> = {};

    if (user.role === 'admin') {
      // Admin sees all
    } else if (user.role === 'teacher') {
      // Teacher sees school + their class events
      query.$or = [{ scope: 'school' }];
    } else {
      // Student/Parent see school + their class events
      query.$or = [{ scope: 'school' }];
    }

    if (scope) query.scope = scope;
    if (scopeId) query.scope_id = scopeId;
    if (from || to) {
      query.date = {};
      if (from) (query.date as Record<string, unknown>).$gte = new Date(from);
      if (to) (query.date as Record<string, unknown>).$lte = new Date(to);
    }

    const events = await CalendarEvent.find(query).sort({ date: 1 });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { scope, scope_id, title, description, date, end_date } = body;

    if (user.role === 'teacher' && scope === 'school') {
      return NextResponse.json({ error: 'Teachers cannot create school-wide events' }, { status: 403 });
    }

    await connectDB();
    const event = await CalendarEvent.create({
      scope,
      scope_id,
      title,
      description,
      date: new Date(date),
      end_date: end_date ? new Date(end_date) : undefined,
      created_by: user._id.toString(),
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Post calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
