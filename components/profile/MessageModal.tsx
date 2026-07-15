'use client';
// components/profile/MessageModal.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

interface MessageModalProps {
  targetUser: User;
  currentUserId: number;
  onClose: () => void;
}

export default function MessageModal({ targetUser, currentUserId, onClose }: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/messages?other_user_id=${targetUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver_id: targetUser.id,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      console.log('Message response:', data, 'Status:', res.status);

      if (!res.ok) {
        toast.error(data.error || `Failed to send message (${res.status})`);
        return;
      }

      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        toast.success('Message sent!');
        // Auto-refresh messages after sending
        setTimeout(() => {
          fetchMessages();
        }, 300);
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Message send error:', err);
      toast.error('Something went wrong');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={onClose}
            className="p-1 -ml-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-display font-bold text-xs overflow-hidden flex-shrink-0">
            {targetUser.profile_image ? (
              <img src={targetUser.profile_image} alt={targetUser.name} className="w-full h-full object-cover" />
            ) : (
              targetUser.name[0].toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none">{targetUser.name}</h3>
            <p className="text-white/70 text-[10px] mt-1">{targetUser.age} yrs • Active</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="w-5 h-5 text-rose-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
            No messages yet. Say hello to start chatting!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                    msg.sender_id === currentUserId
                      ? 'bg-rose-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="text-xs leading-relaxed break-words">{msg.content}</p>
                  <p
                    className={`text-[9px] mt-1 text-right ${
                      msg.sender_id === currentUserId
                        ? 'text-rose-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-100 p-3 bg-white flex items-end gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-gray-50/50 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-rose-600 text-white p-2 rounded-xl hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
