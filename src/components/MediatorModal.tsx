import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Send, 
  Edit3, 
  CheckCircle2, 
  Lock,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  Eye,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { MediatorAnalysisResponse } from '../types';

interface MediatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalDraft: string;
  analysis: MediatorAnalysisResponse;
  recipientName: string;
  onConfirmSend: (textToSend: string, wasMediated: boolean, originalDraftText?: string) => void;
}

export const MediatorModal: React.FC<MediatorModalProps> = ({
  isOpen,
  onClose,
  originalDraft,
  analysis,
  recipientName,
  onConfirmSend,
}) => {
  const [selectedText, setSelectedText] = useState(analysis.suggestedRewrite);
  const [selectedVariant, setSelectedVariant] = useState<'balanced' | 'firm' | 'collaborative'>('balanced');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(analysis.suggestedRewrite);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking when modal closes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen) return null;

  const triggerHaptic = (ms = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore
      }
    }
  };

  // Tone variant switcher
  const handleSelectVariant = (variant: 'balanced' | 'firm' | 'collaborative') => {
    triggerHaptic(10);
    setSelectedVariant(variant);
    let target = analysis.suggestedRewrite;
    if (analysis.variants && analysis.variants[variant]) {
      target = analysis.variants[variant];
    }
    setSelectedText(target);
    setEditedText(target);
  };

  // Speech preview
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    triggerHaptic(10);
    const utterance = new SpeechSynthesisUtterance(selectedText);
    utterance.rate = 0.95; // calm, measured pacing
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // The 3 required actions:
  // 1. Use Suggested Message
  const handleUseSuggested = () => {
    triggerHaptic(20);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onConfirmSend(selectedText, true, originalDraft);
  };

  // 2. Edit Message
  const handleApplyEdit = () => {
    if (!editedText.trim()) return;
    triggerHaptic(20);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onConfirmSend(editedText.trim(), true, originalDraft);
  };

  // 3. Send Original (unmodified)
  const handleSendOriginal = () => {
    triggerHaptic(20);
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onConfirmSend(originalDraft, false);
  };

  const intensityColors = {
    Calm: 'bg-[#ECF3EE] text-[#476B51] border-[#CDE0D3]',
    Moderate: 'bg-[#FCF4F0] text-[#B86237] border-[#F2D7CA]',
    High: 'bg-[#FDF0EE] text-[#C24F3D] border-[#F7CFCA]',
  }[analysis.toneAnalysis.emotionalIntensity] || 'bg-[#F0EEF8] text-[#5D5387] border-[#DDD8EE]';

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#ECE7DF] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#ECE7DF] flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F0EEF8] text-[#7C72A8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-[#252830]">
                AI Mediator Reflection
              </h3>
              <span className="text-[11px] text-[#787F90] block">
                Review before sending to {recipientName}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (isSpeaking && typeof window !== 'undefined') window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1.5 text-[#737A8C] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Privacy badge */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#F0EEF8]/60 border border-[#DDD8EE] rounded-xl text-xs text-[#585078]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#7C72A8]" />
              <span className="font-medium">Strictly Private to You</span>
            </div>
            <span className="text-[11px] text-[#736B94]">
              {recipientName} only sees what you explicitly approve
            </span>
          </div>

          {/* Tone & Understanding Analysis Pill */}
          <div className="p-3.5 bg-white border border-[#ECE7DF] rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737A8C]">
                Tone & Perception
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${intensityColors}`}
              >
                Intensity: {analysis.toneAnalysis.emotionalIntensity}
              </span>
            </div>

            <p className="text-xs text-[#4E5465] leading-relaxed">
              <strong className="text-[#252830] font-medium">What they might hear: </strong>
              {analysis.toneAnalysis.potentialMisunderstanding}
            </p>

            {analysis.toneAnalysis.preservesBoundaries && (
              <div className="pt-1 flex items-start gap-1.5 text-xs text-[#52705B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#63856D] shrink-0 mt-0.5" />
                <span>{analysis.toneAnalysis.preservesBoundaries}</span>
              </div>
            )}
          </div>

          {/* Perspective Preview: What Recipient Hears */}
          {analysis.recipientPerspective && (
            <div className="p-3 bg-[#EBF3EE]/70 border border-[#CDE0D3] rounded-xl text-xs flex items-start gap-2">
              <Eye className="w-3.5 h-3.5 text-[#476B51] shrink-0 mt-0.5" />
              <div className="text-[#36573F] leading-relaxed">
                <strong>{recipientName}'s Likely Reaction: </strong>
                <span>{analysis.recipientPerspective}</span>
              </div>
            </div>
          )}

          {/* Comparison Cards: Original vs Suggested */}
          <div className="space-y-3">
            {/* 1. Original Draft */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D7] rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C93A4]">
                  Your Original Draft
                </span>
                <span className="text-[11px] text-[#A0A6B5] italic">As typed</span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E5465] whitespace-pre-wrap leading-relaxed font-normal">
                "{originalDraft}"
              </p>
            </div>

            {/* 2. Suggested Rewrite Card with Tone Variants & Audio Reader */}
            <div className="p-4 bg-gradient-to-b from-[#F9F8FD] to-white border border-[#D3CCE8] rounded-2xl shadow-sm relative space-y-3">
              {/* Header with tone variant filters and audio preview */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#5D5387]">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C72A8]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Suggested Rewrite
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Hear out loud button */}
                  <button
                    type="button"
                    onClick={handleToggleSpeech}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                      isSpeaking
                        ? 'bg-[#7C72A8] text-white animate-pulse'
                        : 'bg-[#F0EEF8] text-[#584E82] hover:bg-[#E4E0F4]'
                    }`}
                    title={isSpeaking ? 'Stop playback' : 'Listen to how this sounds out loud'}
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="text-[10px] hidden sm:inline">{isSpeaking ? 'Playing' : 'Listen'}</span>
                  </button>

                  {analysis.toneAnalysis.isAlreadyClear && (
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-[#ECF3EE] text-[#476B51] rounded-full border border-[#CDE0D3]">
                      Clear
                    </span>
                  )}
                </div>
              </div>

              {/* Tone Variant selector buttons */}
              {analysis.variants && (
                <div className="flex items-center gap-1.5 bg-[#F0EEF8]/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSelectVariant('balanced')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      selectedVariant === 'balanced'
                        ? 'bg-white text-[#3B3654] shadow-xs'
                        : 'text-[#6A6487] hover:text-[#252830]'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVariant('firm')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      selectedVariant === 'firm'
                        ? 'bg-white text-[#3B3654] shadow-xs'
                        : 'text-[#6A6487] hover:text-[#252830]'
                    }`}
                  >
                    Firm Boundary
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectVariant('collaborative')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      selectedVariant === 'collaborative'
                        ? 'bg-white text-[#3B3654] shadow-xs'
                        : 'text-[#6A6487] hover:text-[#252830]'
                    }`}
                  >
                    Collaborative
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 bg-white border border-[#7C72A8] rounded-xl text-xs sm:text-sm text-[#252830] focus:outline-none focus:ring-1 focus:ring-[#7C72A8]"
                    placeholder="Modify the message in your own voice..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 text-xs text-[#71788A] hover:bg-[#EFECE6] rounded-lg"
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedText(editedText);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1 bg-[#7C72A8] text-white rounded-lg text-xs font-medium"
                    >
                      Keep Modified Wording
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#252830] font-medium leading-relaxed whitespace-pre-wrap">
                  "{selectedText}"
                </p>
              )}

              {/* Mediator Reasoning */}
              <div className="mt-3 pt-3 border-t border-[#ECE7DF] text-xs text-[#5D6475] leading-relaxed">
                <strong className="text-[#3B3850] font-semibold block mb-0.5">
                  Why this helps:
                </strong>
                {analysis.reasoning}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls (The 3 Required Actions) */}
        <div className="p-4 border-t border-[#ECE7DF] bg-white/90 space-y-2">
          {/* Action 1: Use Suggested Message */}
          <button
            onClick={isEditing ? handleApplyEdit : handleUseSuggested}
            className="w-full py-3.5 px-4 bg-[#7C72A8] hover:bg-[#6C6298] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <Check className="w-4 h-4 text-white" />
            <span>
              {isEditing
                ? 'Approve & Send Edited Message'
                : '1. Use Suggested Message & Send'}
            </span>
          </button>

          {/* Action 2: Edit Message */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsEditing(!isEditing);
                if (!isEditing) setEditedText(selectedText);
              }}
              className="py-2.5 px-3 bg-white hover:bg-[#FAF7F2] border border-[#DDD7CC] text-[#424858] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#7C72A8]" />
              <span>{isEditing ? 'Close Editor' : '2. Edit Message'}</span>
            </button>

            {/* Action 3: Send Original */}
            <button
              onClick={handleSendOriginal}
              className="py-2.5 px-3 bg-white hover:bg-[#FAF7F2] border border-[#DDD7CC] text-[#7A5B4C] hover:text-[#5C3F32] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              title="Send your original message text without any AI adjustments"
            >
              <Send className="w-3.5 h-3.5" />
              <span>3. Send Original</span>
            </button>
          </div>

          <p className="text-center text-[10px] text-[#868D9F] pt-0.5">
            The AI never sends messages automatically. You maintain complete control.
          </p>
        </div>
      </div>
    </div>
  );
};
