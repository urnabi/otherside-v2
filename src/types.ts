export interface Participant {
  id: string;
  name: string;
  role: 'creator' | 'invited';
  phoneOrEmail?: string;
  avatarBg?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  wasMediated: boolean;
  originalDraft?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  inviteToken: string;
  title: string;
  participants: Participant[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  topicContext?: string;
}

export interface ToneAnalysis {
  emotionalIntensity: 'Calm' | 'Moderate' | 'High';
  potentialMisunderstanding: string;
  isAlreadyClear: boolean;
  preservesBoundaries: string;
}

export interface MediatorAnalysisResponse {
  suggestedRewrite: string;
  reasoning: string;
  toneAnalysis: ToneAnalysis;
  recipientPerspective?: string;
  variants?: {
    balanced: string;
    firm: string;
    collaborative: string;
  };
}

export type ScreenType = 'welcome' | 'home' | 'chat' | 'invitation' | 'new-chat';
