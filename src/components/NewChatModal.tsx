import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Phone, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Conversation } from '../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (params: {
    recipientName: string;
    phoneOrEmail?: string;
    topicContext?: string;
  }) => Promise<Conversation>;
  onOpenInvitationView: (conv: Conversation) => void;
  onOpenConversation: (convId: string) => void;
  creatorName: string;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onCreateConversation,
  onOpenInvitationView,
  onOpenConversation,
  creatorName,
}) => {
  // Step: 1 = choose contact / manual enter; 2 = share invitation & status
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [topicContext, setTopicContext] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Contact Picker permission note state
  const [showContactNotice, setShowContactNotice] = useState(false);
  const [contactPickerSupported, setContactPickerSupported] = useState(
    typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window
  );

  // Created conversation
  const [createdConv, setCreatedConv] = useState<Conversation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick preset contacts for effortless testing on any device
  const presetContacts = [
    { name: 'Jordan Miller', detail: '+1 (555) 789-0123', topic: 'Discussing budget & upcoming trip' },
    { name: 'Samira Patel', detail: 'samira.p@workplace.com', topic: 'Project timeline and expectations' },
    { name: 'Taylor Vance', detail: '+1 (555) 345-6789', topic: 'Resolving family weekend plans' },
  ];

  if (!isOpen) return null;

  // Handle native Web Contact Picker API
  const handleSelectFromContacts = async () => {
    try {
      setShowContactNotice(true);
      // Check if navigator.contacts is available
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel', 'email'];
        // @ts-ignore - navigator.contacts is standard on supported mobile Chrome browsers
        const contacts = await navigator.contacts.select(props, { multiple: false });
        if (contacts && contacts.length > 0) {
          const selected = contacts[0];
          const name = selected.name?.[0] || '';
          const detail = selected.tel?.[0] || selected.email?.[0] || '';
          if (name) setRecipientName(name);
          if (detail) setPhoneOrEmail(detail);
        }
      } else {
        // Not supported in this browser/environment (desktop or safari)
        // We gracefully explain and keep manual entry prominent
        setShowContactNotice(true);
      }
    } catch (err: any) {
      console.warn('Contact picker error or user cancelled:', err);
    }
  };

  const handleSelectPreset = (contact: typeof presetContacts[0]) => {
    setRecipientName(contact.name);
    setPhoneOrEmail(contact.detail);
    setTopicContext(contact.topic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setErrorMessage('Please provide the person’s name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const conv = await onCreateConversation({
        recipientName: recipientName.trim(),
        phoneOrEmail: phoneOrEmail.trim(),
        topicContext: topicContext.trim(),
      });
      setCreatedConv(conv);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInviteUrl = () => {
    if (!createdConv) return '';
    const origin = window.location.origin;
    return `${origin}/?invite=${createdConv.inviteToken}`;
  };

  const handleCopyLink = async () => {
    const url = getInviteUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    const url = getInviteUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${creatorName} on THE OTHER SIDE`,
          text: `${creatorName} invited you to an AI-mediated conversation on THE OTHER SIDE: “Say what you mean. Understand what they hear.”`,
          url: url,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = getInviteUrl();
    const text = encodeURIComponent(
      `Hi ${recipientName}! ${creatorName} invited you to a mediated conversation on THE OTHER SIDE. The AI helps both of us reframe our messages to avoid misunderstandings: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#ECE7DF] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ECE7DF] flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F0EEF8] text-[#7C72A8] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-[#252830]">
                {step === 1 ? 'Start a New Chat' : 'Invitation Created'}
              </h3>
              <span className="text-[11px] text-[#787F90] block">
                {step === 1 ? 'Choose someone to invite' : 'Share the link to begin'}
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              {/* Permission & Native Contact Access explanation */}
              <div className="p-3 bg-[#F0EEF8]/60 border border-[#DDD8EE] rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#7C72A8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#524B70] leading-relaxed">
                  <p className="font-semibold text-[#3F385B]">Phone Contact Access</p>
                  <p className="text-[11px] text-[#5E577C] mt-0.5">
                    Contact access is only requested to help you quickly select an individual from your phone book without typing. Your address book is never uploaded or saved to our servers.
                  </p>
                </div>
              </div>

              {/* Native Contact Picker Button */}
              <button
                type="button"
                onClick={handleSelectFromContacts}
                className="w-full py-2.5 px-3.5 bg-white hover:bg-[#F7F5F0] border border-[#DDD8EE] rounded-xl text-xs font-medium text-[#463E69] flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Users className="w-4 h-4 text-[#7C72A8]" />
                <span>
                  {contactPickerSupported
                    ? 'Pick Person from Phone Contacts'
                    : 'Select from Phone Contacts (Mobile Chrome)'}
                </span>
              </button>

              {/* Quick Preset Contacts for fast desktop demo */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737A8C] block mb-2">
                  Or select a demo person to test:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {presetContacts.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleSelectPreset(c)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        recipientName === c.name
                          ? 'bg-[#F0EEF8] border-[#7C72A8] text-[#252830]'
                          : 'bg-white border-[#ECE7DF] hover:border-[#D1C9E6] text-[#4A5060]'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-[#252830] block">{c.name}</span>
                        <span className="text-[11px] text-[#787F90]">{c.topic}</span>
                      </div>
                      <span className="text-[10px] text-[#7C72A8] font-medium px-2 py-0.5 bg-white/80 rounded-md border border-[#ECE7DF]">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#252830] mb-1">
                    Person’s Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya, Jordan, Chris"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-sm text-[#252830] placeholder-[#9DA4B4] focus:outline-none focus:border-[#7C72A8] focus:ring-1 focus:ring-[#7C72A8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252830] mb-1">
                    Phone or Email <span className="text-[#8990A1] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="For your reference or direct invite"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-sm text-[#252830] placeholder-[#9DA4B4] focus:outline-none focus:border-[#7C72A8] focus:ring-1 focus:ring-[#7C72A8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#252830] mb-1">
                    Conversation Topic <span className="text-[#8990A1] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apartment lease, weekend plans, project feedback"
                    value={topicContext}
                    onChange={(e) => setTopicContext(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-sm text-[#252830] placeholder-[#9DA4B4] focus:outline-none focus:border-[#7C72A8] focus:ring-1 focus:ring-[#7C72A8]"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-[#BC4B4B] bg-[#FDF0F0] p-2.5 rounded-xl border border-[#F5D0D0]">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !recipientName.trim()}
                  className="w-full py-3 px-4 bg-[#252830] hover:bg-[#393E4D] disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <span>Generating Invitation...</span>
                  ) : (
                    <>
                      <span>Generate Secure Invitation</span>
                      <ArrowRight className="w-4 h-4 text-[#C1BAE1]" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: Invitation Link & Sharing */
            <div className="space-y-4">
              {/* Status Banner */}
              <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E2D7] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#DE8C68]/20 text-[#DE8C68] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#252830] block">
                      Invitation Status: <span className="text-[#DE8C68]">Pending</span>
                    </span>
                    <span className="text-[11px] text-[#787F90]">
                      Awaiting acceptance from {recipientName}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-[#FCF4F0] text-[#DE8C68] rounded-md border border-[#F2D7CA]">
                  Unaccepted
                </span>
              </div>

              {/* Access Control Notice */}
              <div className="p-3 bg-white border border-[#ECE7DF] rounded-xl text-xs text-[#5D6475] leading-relaxed">
                <strong className="text-[#252830] block mb-0.5">Access Protection</strong>
                The shared chat will only activate once {recipientName} accepts your invitation. Private drafts are never exposed.
              </div>

              {/* Unique Invitation Link Box */}
              <div>
                <label className="block text-xs font-semibold text-[#252830] mb-1.5">
                  Unique Invitation Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getInviteUrl()}
                    className="w-full px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-xs text-[#5D6475] font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 bg-[#252830] text-white rounded-xl text-xs hover:bg-[#383D4A] transition-colors shrink-0 flex items-center gap-1.5"
                    title="Copy Invitation Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#87D4A2]" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737A8C] block">
                  Share via:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 bg-[#EAF7EE] hover:bg-[#DDF2E3] border border-[#BCE4C7] rounded-xl text-xs font-semibold text-[#246B37] flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="py-2.5 px-3 bg-[#F0EEF8] hover:bg-[#E4E0F4] border border-[#D3CDEE] rounded-xl text-xs font-semibold text-[#5A5084] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Sheet</span>
                  </button>
                </div>
              </div>

              {/* Preview & Instant Testing Button */}
              <div className="pt-2 border-t border-[#ECE7DF] space-y-2">
                <div className="p-3 bg-white/70 border border-[#ECE7DF] rounded-xl">
                  <span className="text-[11px] text-[#7A8192] block mb-1">
                    Simulate recipient experience:
                  </span>
                  <button
                    onClick={() => {
                      if (createdConv) {
                        onClose();
                        onOpenInvitationView(createdConv);
                      }
                    }}
                    className="w-full py-2.5 px-3 bg-[#63856D] hover:bg-[#52725C] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open as Recipient ({recipientName}) to Accept</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
