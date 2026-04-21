'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Search, Loader } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import MessageModal from '@/components/profile/MessageModal';

interface Conversation {
  user_id: number;
  name: string;
  profile_image?: string;
  last_message?: string;
  last_message_time?: string;
  unread?: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(decoded.userId);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  async function fetchConversations() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Connect and chat with your matches</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Conversations Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm
                ? 'Try a different search'
                : 'Start messaging to create conversations'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConversations.map((conv) => (
              <div
                key={conv.user_id}
                onClick={() => {
                  setSelectedConversation(conv);
                  setShowMessageModal(true);
                }}
                className="card p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
              >
                {/* User Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {conv.profile_image ? (
                      <img
                        src={conv.profile_image}
                        alt={conv.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      conv.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {conv.last_message_time
                        ? new Date(conv.last_message_time).toLocaleDateString()
                        : 'No messages'}
                    </p>
                  </div>
                  {conv.unread && (
                    <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                  )}
                </div>

                {/* Last Message */}
                {conv.last_message && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {conv.last_message}
                  </p>
                )}

                {/* View Button */}
                <button className="mt-3 w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedConversation && currentUserId && (
        <MessageModal
          targetUser={{ id: selectedConversation.user_id, name: selectedConversation.name } as any}
          currentUserId={currentUserId}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedConversation(null);
            fetchConversations();
          }}
        />
      )}
    </div>
  );
}
