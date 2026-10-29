import React from 'react';
import { X, RotateCcw, ShieldCheck, HeartHandshake, EyeOff, Sparkles, BookOpen, Smartphone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => Promise<void>;
  userName: string;
  onOpenAndroidInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  userName,
  onOpenAndroidInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#ECE7DF] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ECE7DF] flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <div>
              <h3 className="font-serif font-medium text-base text-[#252830]">
                About & Principles
              </h3>
              <span className="text-[11px] text-[#787F90] block">
                THE OTHER SIDE Communication Assistant
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737A8C] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#4F5566] leading-relaxed">
          {/* Core Constitution */}
          <div className="p-4 bg-white border border-[#ECE7DF] rounded-2xl shadow-xs space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#7C72A8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Mediator Constitution
            </h4>
            <p>
              “THE OTHER SIDE is a neutral, empathetic, and transparent communication assistant. Our role is to improve communication and mutual understanding, not to decide who is right or wrong.”
            </p>
          </div>

          {/* Guarantees */}
          <div className="space-y-2">
            <div className="p-3 bg-white/70 border border-[#ECE7DF] rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#63856D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#252830] block">You Retain Full Autonomy</strong>
                <span>The mediator never sends messages automatically. You must approve every final word before it appears in the chat.</span>
              </div>
            </div>

            <div className="p-3 bg-white/70 border border-[#ECE7DF] rounded-xl flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-[#7C72A8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#252830] block">Private Drafts</strong>
                <span>Unsent drafts, tone analysis, and rejected rewrites are never shown to the other participant.</span>
              </div>
            </div>

            <div className="p-3 bg-white/70 border border-[#ECE7DF] rounded-xl flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-[#DE8C68] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#252830] block">Boundaries Are Protected</strong>
                <span>Respectful communication can still be firm. The AI does not soften legitimate boundaries, invent facts, or force reconciliation.</span>
              </div>
            </div>
          </div>

          {/* Android App & APK packaging */}
          {onOpenAndroidInstall && (
            <div className="pt-2 border-t border-[#ECE7DF]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#36573F] block mb-2">
                Android Platform
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenAndroidInstall();
                }}
                className="w-full py-2.5 px-3 bg-[#EBF3EE] hover:bg-[#DFEDE3] border border-[#CDE0D3] rounded-xl text-xs font-semibold text-[#36573F] flex items-center justify-center gap-2 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#477053]" />
                <span>Android App & APK Packaging</span>
              </button>
            </div>
          )}

          {/* Data Management */}
          <div className="pt-2 border-t border-[#ECE7DF]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737A8C] block mb-2">
              Data & Conversation Management
            </span>
            <button
              onClick={async () => {
                if (confirm('Reset demo conversations and restore initial seed messages?')) {
                  await onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 bg-white hover:bg-[#FAF7F2] border border-[#DDD7CC] rounded-xl text-xs font-semibold text-[#4A5060] flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#7C72A8]" />
              <span>Reset to Default Demo Conversations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
