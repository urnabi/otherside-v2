import React, { useState } from 'react';
import { Plus, MessageSquare, Clock, User, ChevronRight, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Download } from 'lucide-react';
import { Conversation, Participant } from '../types';

interface HomeScreenProps {
  conversations: Conversation[];
  activeUserId: string;
  onOpenConversation: (id: string) => void;
  onStartNewChat: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenAndroidInstall?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  conversations,
  activeUserId,
  onOpenConversation,
  onStartNewChat,
  onRefresh,
  isLoading,
  onOpenAndroidInstall,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'active') return c.status === 'accepted';
    if (filter === 'pending') return c.status === 'pending';
    return true;
  });

  const getOtherParticipant = (conv: Conversation): Participant => {
    const other = conv.participants.find((p) => p.id !== activeUserId);
    return other || conv.participants[0] || { id: 'unknown', name: 'Participant', role: 'invited' };
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs < 1) {
        const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
        return `${mins}m ago`;
      }
      if (diffHrs < 24) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffHrs < 48) {
        return 'Yesterday';
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* Hero Action: Start New Chat */}
      <div className="p-4 pt-3">
        <button
          onClick={onStartNewChat}
          className="w-full relative overflow-hidden bg-gradient-to-r from-[#3B3850] via-[#484263] to-[#5C557E] text-white p-4 sm:p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 text-left group active:scale-[0.99] border border-[#524B70]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#DDD8F0] block">
                  AI-Mediated Dialogue
                </span>
                <h2 className="text-base sm:text-lg font-serif font-medium text-white tracking-tight">
                  Start a New Chat
                </h2>
                <p className="text-xs text-[#D1CCE8] mt-0.5 line-clamp-1">
                  Invite someone to talk with a calm, neutral mediator
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Android App Quick Action */}
        {onOpenAndroidInstall && (
          <div
            onClick={onOpenAndroidInstall}
            className="mt-2.5 p-3 bg-gradient-to-r from-[#EBF3EE] to-[#F3F7F4] border border-[#CDE0D3] hover:border-[#ADC7B5] rounded-xl cursor-pointer transition-all flex items-center justify-between group active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#36573F] text-white flex items-center justify-center shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#294230] block leading-tight">
                  Android App & APK
                </span>
                <span className="text-[11px] text-[#4F6354]">
                  Install to Android device or build Google Play package
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#36573F] group-hover:translate-x-0.5 transition-transform">
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#ECE7DF]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#252830] text-white'
                : 'bg-transparent text-[#61687B] hover:bg-[#EFECE6]'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'active'
                ? 'bg-[#252830] text-white'
                : 'bg-transparent text-[#61687B] hover:bg-[#EFECE6]'
            }`}
          >
            Active ({conversations.filter((c) => c.status === 'accepted').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-[#252830] text-white'
                : 'bg-transparent text-[#61687B] hover:bg-[#EFECE6]'
            }`}
          >
            Pending Invites ({conversations.filter((c) => c.status === 'pending').length})
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 text-[#6D7486] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors"
          title="Refresh conversations"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Older Chats List */}
      <div className="px-4 py-3 flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#737A8C]">
            Older Chats & History
          </h3>
          <span className="text-[11px] text-[#868D9F]">
            {filteredConversations.length} conversation{filteredConversations.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center bg-white/70 border border-[#ECE7DF] rounded-2xl my-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F0EEF8] text-[#7C72A8] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-serif font-medium text-[#252830] mb-1">
              No conversations found
            </h4>
            <p className="text-xs text-[#6A7182] max-w-xs mx-auto mb-4">
              Start a new chat to invite someone to a calm, mediated space.
            </p>
            <button
              onClick={onStartNewChat}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C72A8] text-white rounded-xl text-xs font-medium shadow-sm hover:bg-[#6C6298] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start New Chat</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const lastMessage = conv.messages[conv.messages.length - 1];
              const isPending = conv.status === 'pending';
              const isDeclined = conv.status === 'declined';

              return (
                <div
                  key={conv.id}
                  onClick={() => onOpenConversation(conv.id)}
                  className="p-3.5 bg-white border border-[#ECE7DF] hover:border-[#D1C9E6] rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer group active:scale-[0.99] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with status indicator */}
                    <div className="relative shrink-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-serif font-medium text-base shadow-sm"
                        style={{ backgroundColor: other.avatarBg || '#7C72A8' }}
                      >
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                      {isPending && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#F2A359] border-2 border-white rounded-full flex items-center justify-center text-white"
                          title="Invitation pending acceptance"
                        >
                          <Clock className="w-2.5 h-2.5" />
                        </div>
                      )}
                      {conv.status === 'accepted' && (
                        <div
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#63856D] border-2 border-white rounded-full flex items-center justify-center text-white"
                          title="Active conversation"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Conversation preview info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#252830] truncate group-hover:text-[#584E82] transition-colors">
                          {other.name}
                        </h4>
                        <span className="text-[11px] text-[#8C93A4] shrink-0 font-normal">
                          {formatTimestamp(conv.updatedAt)}
                        </span>
                      </div>

                      {/* Topic title if available */}
                      {conv.topicContext && (
                        <span className="text-[11px] text-[#7C72A8] font-medium block truncate -mt-0.5 mb-0.5">
                          {conv.topicContext}
                        </span>
                      )}

                      {/* Last message or invitation state */}
                      <p className="text-xs text-[#5D6475] truncate">
                        {isPending ? (
                          <span className="text-[#DE8C68] font-medium flex items-center gap-1">
                            <span>Invitation pending</span> · Recipient hasn’t joined yet
                          </span>
                        ) : isDeclined ? (
                          <span className="text-[#9E6565] italic">
                            Invitation was declined
                          </span>
                        ) : lastMessage ? (
                          <span>
                            {lastMessage.senderId === activeUserId ? 'You: ' : ''}
                            {lastMessage.text}
                          </span>
                        ) : (
                          <span className="italic text-[#8C93A4]">
                            Chat opened. Send the first message.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center text-[#9EA5B4] group-hover:text-[#584E82] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reassuring footer notice */}
      <div className="px-6 mt-4 text-center">
        <p className="text-[11px] text-[#868D9F] leading-relaxed">
          Both participants have access to the neutral AI Mediator for drafting messages.
        </p>
      </div>
    </div>
  );
};
