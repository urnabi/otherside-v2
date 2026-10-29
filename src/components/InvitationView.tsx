import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  HeartHandshake, 
  MessageSquare, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Conversation } from '../types';
import { BrandLogo } from './BrandLogo';

interface InvitationViewProps {
  conversation: Conversation;
  onAccept: (conv: Conversation) => void;
  onDecline: (conv: Conversation) => void;
  onReturnHome: () => void;
}

export const InvitationView: React.FC<InvitationViewProps> = ({
  conversation,
  onAccept,
  onDecline,
  onReturnHome,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const sender = conversation.participants.find((p) => p.role === 'creator') || conversation.participants[0];
  const recipient = conversation.participants.find((p) => p.role === 'invited') || conversation.participants[1];

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await onAccept(conversation);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsProcessing(true);
      setError('');
      await onDecline(conversation);
    } catch (err: any) {
      setError(err.message || 'Failed to decline invitation');
      setIsProcessing(false);
    }
  };

  const isAlreadyAccepted = conversation.status === 'accepted';
  const isDeclined = conversation.status === 'declined';

  return (
    <div className="min-h-full flex flex-col justify-between p-5 max-w-md mx-auto text-[#252830]">
      {/* Top Banner & Sender Identity */}
      <div className="pt-4 text-center flex flex-col items-center">
        <div className="mb-4">
          <BrandLogo size="lg" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0EEF8] text-[#5A5084] rounded-full text-xs font-semibold tracking-wide uppercase mb-3 border border-[#DDD8EE]">
          <Sparkles className="w-3.5 h-3.5 text-[#7C72A8]" />
          Mediated Conversation Invitation
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#22252E] mb-2 leading-tight">
          {sender.name} invited you to talk
        </h1>

        <p className="text-sm text-[#5C6374] max-w-sm">
          {conversation.topicContext ? (
            <span>
              Regarding: <strong className="text-[#252830] font-medium">"{conversation.topicContext}"</strong>
            </span>
          ) : (
            'To have a constructive, thoughtful discussion on THE OTHER SIDE.'
          )}
        </p>
      </div>

      {/* Purpose of the App & AI Mediator explanation */}
      <div className="my-5 space-y-3">
        <div className="bg-white border border-[#ECE7DF] rounded-2xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7C72A8]">
            What is THE OTHER SIDE?
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5060] leading-relaxed">
            A neutral, private messaging space designed to reduce misunderstandings. Both you and {sender.name} will have access to an empathetic AI mediator that helps reframe private drafts before sending.
          </p>
        </div>

        {/* Core Guarantees */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-white/70 border border-[#ECE7DF] rounded-xl text-xs">
            <div className="p-1.5 bg-[#ECF3EE] text-[#63856D] rounded-lg shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-[#252830] block">AI Never Sends Automatically</strong>
              <span className="text-[#5D6475]">
                The mediator only suggests clearer, calmer wording. You decide whether to use it, edit it, or send your original words.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/70 border border-[#ECE7DF] rounded-xl text-xs">
            <div className="p-1.5 bg-[#F0EEF8] text-[#7C72A8] rounded-lg shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-[#252830] block">Private Drafts Stay Private</strong>
              <span className="text-[#5D6475]">
                Neither person can see the other’s drafts, suggestions, or rejected text. Only approved final messages appear in the chat.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/70 border border-[#ECE7DF] rounded-xl text-xs">
            <div className="p-1.5 bg-[#FCF4F0] text-[#DE8C68] rounded-lg shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-[#252830] block">Equal, Non-Judgemental Mediation</strong>
              <span className="text-[#5D6475]">
                The AI does not decide who is right or wrong, nor does it force apologies or agreement. It protects healthy communication.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pb-4 pt-2 space-y-2.5">
        {error && (
          <p className="text-xs text-[#BC4B4B] bg-[#FDF0F0] p-2.5 rounded-xl border border-[#F5D0D0] text-center">
            {error}
          </p>
        )}

        {isAlreadyAccepted ? (
          <button
            onClick={() => onAccept(conversation)}
            className="w-full py-3.5 px-5 bg-[#63856D] hover:bg-[#52725C] text-white rounded-2xl font-medium text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Invitation Accepted · Open Shared Chat</span>
          </button>
        ) : isDeclined ? (
          <div className="p-4 bg-[#F9F5F5] border border-[#ECDCDC] rounded-2xl text-center space-y-2">
            <p className="text-xs text-[#7B4E4E] font-medium">
              You previously declined this invitation.
            </p>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="text-xs font-semibold text-[#7C72A8] underline"
            >
              Change mind and accept anyway
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full py-3.5 px-5 bg-[#252830] hover:bg-[#383D4A] disabled:opacity-50 text-white rounded-2xl font-medium text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              <span>{isProcessing ? 'Connecting...' : 'Accept Invitation & Enter Chat'}</span>
              <ArrowRight className="w-4 h-4 text-[#C1BAE1] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 bg-transparent hover:bg-[#EFECE6] text-[#71788A] hover:text-[#252830] rounded-xl text-xs font-medium transition-colors"
            >
              Decline Invitation
            </button>
          </div>
        )}

        <button
          onClick={onReturnHome}
          className="w-full text-center text-xs text-[#8990A2] hover:text-[#252830] pt-1"
        >
          Return to All Chats
        </button>
      </div>
    </div>
  );
};
