"use client";

import { useEffect, useState } from "react";
import { Send, MessageSquare, User, ChevronDown } from "lucide-react";

interface MessageThread {
  thread_id: string;
  student_name: string;
  parent_name: string;
  last_message: string;
  last_sent_at: string;
  unread: boolean;
}

interface Message {
  _id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  read_at?: string;
}

interface Student {
  _id: string;
  name: string;
  student_id: string;
}

export default function TeacherMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUserId(JSON.parse(userData).id);
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/students", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([msgData, studentData]) => {
      const allMessages: Message[] = msgData.messages || [];
      const threadMap = new Map<string, MessageThread>();
      allMessages.forEach((msg) => {
        if (!threadMap.has(msg.thread_id)) {
          threadMap.set(msg.thread_id, { thread_id: msg.thread_id, student_name: "Student", parent_name: "Parent", last_message: msg.body, last_sent_at: msg.sent_at, unread: !msg.read_at });
        } else {
          const existing = threadMap.get(msg.thread_id)!;
          if (new Date(msg.sent_at) > new Date(existing.last_sent_at)) { existing.last_message = msg.body; existing.last_sent_at = msg.sent_at; }
          if (!msg.read_at) existing.unread = true;
        }
      });
      setThreads(Array.from(threadMap.values()));
      setStudents(studentData.students || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadThreadMessages = async (threadId: string) => {
    setSelectedThread(threadId);
    const token = localStorage.getItem("token");
    fetch(`/api/messages?thread_id=${threadId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((data) => setMessages(data.messages || []));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedThread && (!recipientId || !selectedStudent))) return;
    setSending(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipient_id: recipientId, student_context_id: selectedStudent, body: newMessage, thread_id: selectedThread || undefined }),
    });
    if (res.ok) {
      setNewMessage("");
      setShowCompose(false);
      const refreshed = await fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } });
      const data = await refreshed.json();
      const allMessages: Message[] = data.messages || [];
      if (selectedThread) setMessages(allMessages.filter(m => m.thread_id === selectedThread));
    }
    setSending(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Communicate with parents about their children</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
          New Message
        </button>
      </div>

      {showCompose && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fade-in">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">Compose New Message</h2>
          <form onSubmit={handleSend} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">About Student</label>
                <div className="relative">
                  <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none">
                    <option value="">Select student...</option>
                    {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.student_id})</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Parent/Recipient ID</label>
                <input type="text" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" placeholder="Parent user ID" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" rows={3} placeholder="Type your message to the parent..." />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">Cancel</button>
              <button type="submit" disabled={sending || !newMessage.trim()} className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50">{sending ? "Sending..." : "Send Message"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-sm text-[var(--foreground)]">Conversations</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" /></div>
            ) : threads.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />No conversations yet</div>
            ) : (
              threads.map((thread) => (
                <button key={thread.thread_id} onClick={() => loadThreadMessages(thread.thread_id)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedThread === thread.thread_id ? "bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${thread.unread ? "font-semibold" : "font-medium"}`}>{thread.student_name}</p>
                        {thread.unread && <div className="w-2 h-2 rounded-full bg-[var(--accent)] ml-1 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{thread.last_message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[var(--foreground)] text-sm">{selectedThread ? "Conversation" : "Select a conversation"}</h2>
          </div>
          {selectedThread ? (
            <>
              <div className="flex-1 divide-y divide-gray-50 overflow-y-auto max-h-96">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No messages in this thread</div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg._id} className={`px-5 py-3 flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-[var(--primary)] text-white rounded-br-sm" : "bg-gray-100 text-[var(--foreground)] rounded-bl-sm"}`}>
                          <p>{msg.body}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? "text-white/60" : "text-gray-400"}`}>
                            {new Date(msg.sent_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" placeholder="Type a reply..." />
                  <button type="submit" disabled={sending || !newMessage.trim()} className="p-2.5 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] disabled:opacity-50 transition-all"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" /><p>Select a conversation to view messages</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
