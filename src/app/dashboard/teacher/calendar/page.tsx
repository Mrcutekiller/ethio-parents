"use client";

import { useEffect, useState } from "react";
import { Calendar as CalIcon, Plus, X } from "lucide-react";

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<{
    _id: string;
    title: string;
    date: string;
    scope: string;
    description?: string;
  }[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    scope: "class" as "class" | "school",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/calendar", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEvent),
    });

    if (res.ok) {
      setShowCreate(false);
      setNewEvent({ title: "", description: "", date: "", scope: "class" });
      const refreshed = await fetch("/api/calendar", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await refreshed.json();
      setEvents(data.events || []);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Manage class events and assignments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No events yet</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                  <CalIcon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()} • {event.scope}
                  </p>
                  {event.description && (
                    <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold">New Event</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--primary)] text-white py-2 rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
