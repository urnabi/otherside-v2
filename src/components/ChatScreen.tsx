import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  MoreVertical, 
  Users, 
  Trash2, 
  Share2, 
  Clock, 
  Info,
  Loader2,
  Lock,
  ChevronDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Conversation, Message, Participant, MediatorAnalysisResponse } from '../types';
import { MediatorModal } from './MediatorModal';

interface ChatScreenProps {
  conversation: Conversation;
  activeUserId: string;
  onBackToHome: () => void;
  onSendMessage: (text: string, wasMediated: boolean, originalDraft?: string) => Promise<void>;
  onAnalyzeDraft: (draft: string) => Promise<MediatorAnalysisResponse>;
  onSwitchActiveParticipant: (participantId: string) => void;
  onDeleteConversation: (convId: string) => Promise<void>;
  onOpenInvitation: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversation,
  activeUserId,
  onBackToHome,
  onSendMessage,
  onAnalyzeDraft,
  onSwitchActiveParticipant,
  onDeleteConversation,
  onOpenInvitation,
}) => {
  const [draft, setDraft] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MediatorAnalysisResponse | null>(null);
  const [showMediatorModal, setShowMediatorModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active user and other participant
  const currentParticipant =
    conversation.participants.find((p) => p.id === activeUserId) || conversation.participants[0];
  const otherParticipant =
    conversation.participants.find((p) => p.id !== activeUserId) ||
    conversation.participants[1] || { id: 'other', name: 'Partner', role: 'invited' };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // Adjust textarea height dynamically
  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Trigger AI Mediator Analysis on draft
  const handleReviewWithMediator = async () => {
    if (!draft.trim()) return;
    try {
      setIsAnalyzing(true);
      setErrorNotice('');
      const result = await onAnalyzeDraft(draft.trim());
      setAnalysisResult(result);
      setShowMediatorModal(true);
    } catch (err: any) {
      setErrorNotice(err.message || 'Unable to reach AI mediator. You can still send directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Called when user selects an action in the Mediator modal
  const handleConfirmSendFromModal = async (
    textToSend: string,
    wasMediated: boolean,
    originalDraftText?: string
  ) => {
    setShowMediatorModal(false);
    try {
      setIsSendingDirect(true);
      await onSendMessage(textToSend, wasMediated, originalDraftText);
      setDraft('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to send message');
    } finally {
      setIsSendingDirect(false);
    }
  };

  // Send original directly (bypass modal if user desires quick send)
  const handleDirectSend = async () => {
    if (!draft.trim()) return;
    try {
      setIsSendingDirect(true);
      await onSendMessage(draft.trim(), false);
      setDraft('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to send message');
    } finally {
      setIsSendingDirect(false);
    }
  };

  // Quick starter draft templates to test emotional rephrasing
  const sampleEmotionalPhrases = [
    'You always ignore what I say and do whatever you want.',
    'I need you to stop texting me after 8 PM, it is crossing my personal boundary.',
    'Whatever, do whatever you want like you always do.',
    'Can we talk through our schedule tonight so things stay fair?',
  ];

  const formatMessageTime = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] relative">
      {/* Conversation Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#ECE7DF] px-3.5 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBackToHome}
            className="p-1.5 -ml-1 text-[#6A7182] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors active:scale-95"
            title="Older Chats"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Participant avatar and title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-medium text-sm shadow-xs shrink-0"
              style={{ backgroundColor: otherParticipant.avatarBg || '#63856D' }}
            >
              {otherParticipant.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#252830] truncate flex items-center gap-1.5 leading-tight">
                <span>{otherParticipant.name}</span>
                {conversation.status === 'pending' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 bg-[#FCF4F0] text-[#DE8C68] rounded border border-[#F2D7CA]">
                    Pending Invite
                  </span>
                )}
              </h2>
              <span className="text-[11px] text-[#7A8192] flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63856D]" />
                <span>AI Mediated Dialogue</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5">
          {/* Active Mediator indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 bg-[#F0EEF8] text-[#584E82] rounded-full text-[11px] font-medium border border-[#DDD8EE]"
            title="THE OTHER SIDE AI Mediator is active"
          >
            <Sparkles className="w-3 h-3 text-[#7C72A8]" />
            <span className="hidden xs:inline">Mediator Active</span>
          </div>

          {/* Menu Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-[#6A7182] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors"
              title="Conversation options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#ECE7DF] rounded-2xl shadow-lg p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenInvitation();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#4A5060] hover:bg-[#FAF8F5] rounded-xl flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#7C72A8]" />
                  <span>View Invitation Link</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm('Leave and delete this conversation?')) {
                      onDeleteConversation(conversation.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#BA4949] hover:bg-[#FDF2F2] rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Leave Conversation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Sided Participant Testing Switcher Bar */}
      <div className="bg-[#FAF7F2] border-b border-[#E8E2D7] px-4 py-1.5 flex items-center justify-between text-xs text-[#5D6475]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-[11px] text-[#868D9F] uppercase tracking-wider font-semibold">
            Speaking As:
          </span>
          <span className="font-semibold text-[#252830]">{currentParticipant.name}</span>
        </div>
        <button
          onClick={() => {
            const nextP = conversation.participants.find((p) => p.id !== activeUserId);
            if (nextP) onSwitchActiveParticipant(nextP.id);
          }}
          className="text-[11px] font-medium text-[#7C72A8] hover:text-[#524976] bg-white border border-[#DDD8EE] px-2.5 py-0.5 rounded-full hover:bg-[#F0EEF8] transition-colors shrink-0 flex items-center gap-1"
          title="Switch participant to test both sides of the mediated chat"
        >
          <span>Switch to {otherParticipant.name}</span>
          <span className="text-[10px] text-[#8C93A4]">(Test Both)</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Mediator Grounding Card */}
        <div className="p-3 bg-white/70 border border-[#ECE7DF] rounded-2xl max-w-sm mx-auto text-center space-y-1 my-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#5D5387]">
            <Sparkles className="w-3.5 h-3.5 text-[#7C72A8]" />
            <span>AI Mediator Active in this Space</span>
          </div>
          <p className="text-[11px] text-[#6E7586] leading-relaxed">
            The mediator helps reframe private drafts to reduce misunderstandings. Neither person’s private drafts or rejected suggestions are ever shared.
          </p>
        </div>

        {conversation.messages.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#808799] my-6">
            <p className="font-medium text-[#252830] mb-1">No messages yet</p>
            <p>Type a draft below. You can review it with the mediator before sending.</p>
          </div>
        ) : (
          conversation.messages.map((msg) => {
            const isMe = msg.senderId === activeUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Sender label if not me */}
                {!isMe && (
                  <span className="text-[11px] font-medium text-[#737A8C] mb-1 ml-1">
                    {msg.senderName}
                  </span>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative transition-all ${
                    isMe
                      ? 'bg-[#3B3654] text-white rounded-br-xs'
                      : 'bg-white text-[#252830] border border-[#ECE7DF] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Mediated indicator badge */}
                  {msg.wasMediated && (
                    <div
                      className={`mt-2 pt-1.5 flex items-center justify-between border-t text-[10px] ${
                        isMe
                          ? 'border-white/15 text-[#D7D2EE]'
                          : 'border-[#ECE7DF] text-[#7C72A8]'
                      }`}
                    >
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-[#B7AEE0]" />
                        <span>Mediator-Reframed</span>
                      </span>

                      {/* If viewing as author, can toggle original draft */}
                      {isMe && msg.originalDraft && (
                        <details className="cursor-pointer">
                          <summary className="hover:underline text-[9px] list-none select-none">
                            View original
                          </summary>
                          <p className="mt-1 p-1.5 bg-black/20 rounded text-[10px] text-white/90 italic">
                            "{msg.originalDraft}"
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp & Delivery status */}
                <div
                  className={`flex items-center gap-1 mt-1 text-[10px] text-[#8C93A4] ${
                    isMe ? 'mr-1' : 'ml-1'
                  }`}
                >
                  <span>{formatMessageTime(msg.timestamp)}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-[#63856D]" />
                      ) : (
                        <Check className="w-3 h-3 text-[#8C93A4]" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Draft Message Input Area & Mediator Trigger */}
      <div className="bg-white border-t border-[#ECE7DF] p-3 sm:p-4 shadow-sm">
        {/* Sample draft pills to test quickly */}
        <div className="mb-2.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C93A4] block mb-1">
            Test a difficult emotion draft:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {sampleEmotionalPhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDraft(phrase);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="text-[11px] px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#F0EEF8] text-[#555C6E] hover:text-[#3E375E] border border-[#ECE7DF] hover:border-[#D1CCE8] rounded-full shrink-0 transition-colors"
              >
                "{phrase.slice(0, 32)}..."
              </button>
            ))}
          </div>
        </div>

        {errorNotice && (
          <p className="text-xs text-[#B54242] bg-[#FDF2F2] p-2 rounded-xl mb-2 border border-[#F5D4D4]">
            {errorNotice}
          </p>
        )}

        <div className="relative bg-[#FAF8F5] border border-[#DDD7CC] rounded-2xl focus-within:border-[#7C72A8] focus-within:ring-1 focus-within:ring-[#7C72A8] p-2 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={draft}
            onChange={handleDraftChange}
            placeholder={`Draft your message to ${otherParticipant.name}... (the mediator helps you review before sending)`}
            className="w-full bg-transparent resize-none text-xs sm:text-sm text-[#252830] placeholder-[#959DAF] outline-none px-2 py-1 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1.5 border-t border-[#ECE7DF]/80 mt-1 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-[#787F92]">
              <Lock className="w-3 h-3 text-[#7C72A8]" />
              <span className="hidden sm:inline">Draft is completely private</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Review with Mediator Button (Primary Action) */}
              <button
                type="button"
                onClick={handleReviewWithMediator}
                disabled={!draft.trim() || isAnalyzing}
                className="py-1.5 px-3 bg-[#7C72A8] hover:bg-[#685E92] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mediator Reflecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Review with Mediator</span>
                  </>
                )}
              </button>

              {/* Direct Send Original Button */}
              <button
                type="button"
                onClick={handleDirectSend}
                disabled={!draft.trim() || isSendingDirect}
                className="p-2 text-[#656C7E] hover:text-[#252830] hover:bg-[#EFECE6] disabled:opacity-30 rounded-xl transition-colors"
                title="Send original without mediator assistance"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mediator Review Modal */}
      {analysisResult && (
        <MediatorModal
          isOpen={showMediatorModal}
          onClose={() => setShowMediatorModal(false)}
          originalDraft={draft}
          analysis={analysisResult}
          recipientName={otherParticipant.name}
          onConfirmSend={handleConfirmSendFromModal}
        />
      )}
    </div>
  );
};
