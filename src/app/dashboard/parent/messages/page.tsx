"use client";

import { useEffect, useState } from "react";
import { Send, MessageSquare } from "lucide-react";

export default function ParentMessagesPage() {
  const [messages, setMessages] = useState<{
    _id: string;
    thread_id: string;
    sender_id: string;
    body: string;
    sent_at: string;
    read_at?: string;
  }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [studentContextId, setStudentContextId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setMessages(data.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId || !studentContextId) return;
    setSending(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipient_id: recipientId, student_context_id: studentContextId, body: newMessage }),
    });
    if (res.ok) {
      setNewMessage("");
      const refreshed = await fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } });
      const data = await refreshed.json();
      setMessages(data.messages || []);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Communicate with teachers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-gray-400" />
            New Message
          </h2>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Teacher ID</label>
              <input type="text" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" placeholder="Teacher user ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Student Context</label>
              <input type="text" value={studentContextId} onChange={(e) => setStudentContextId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" placeholder="Student profile ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" rows={3} placeholder="Type your message..." />
            </div>
            <button type="submit" disabled={sending || !newMessage.trim()} className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 shadow-sm">
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-[var(--foreground)]">Inbox</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`px-5 py-3 hover:bg-gray-50/50 transition-colors ${!msg.read_at ? "bg-blue-50/30" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!msg.read_at ? "font-semibold" : ""}`}>{msg.body}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(msg.sent_at).toLocaleString()}</p>
                    </div>
                    {!msg.read_at && <span className="w-2 h-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
