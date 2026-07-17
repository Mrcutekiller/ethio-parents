"use client";

import { useEffect, useState } from "react";
import { Calendar as CalIcon } from "lucide-react";

export default function ParentCalendarPage() {
  const [events, setEvents] = useState<{
    _id: string;
    title: string;
    date: string;
    scope: string;
    description?: string;
  }[]>([]);
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

  const scopeColor: Record<string, string> = {
    school: "bg-blue-100 text-blue-700",
    class: "bg-green-100 text-green-700",
    personal: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">School events and important dates</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No upcoming events</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {events.map((event) => (
              <div key={event._id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalIcon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{event.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${scopeColor[event.scope] || "bg-gray-100"}`}>
                      {event.scope}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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
    </div>
  );
}
