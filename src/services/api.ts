import { Conversation, Message, MediatorAnalysisResponse } from '../types';

export const api = {
  // Fetch all conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) throw new Error('Failed to load conversations');
    const data = await res.json();
    return data.conversations || [];
  },

  // Fetch single conversation by id or invite token
  async getConversation(idOrToken: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(idOrToken)}`);
    if (!res.ok) throw new Error('Conversation not found');
    const data = await res.json();
    return data.conversation;
  },

  // Create new conversation
  async createConversation(params: {
    recipientName: string;
    phoneOrEmail?: string;
    topicContext?: string;
    creatorName?: string;
  }): Promise<Conversation> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create conversation');
    }
    const data = await res.json();
    return data.conversation;
  },

  // Recipient accepts invitation
  async acceptInvitation(idOrToken: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(idOrToken)}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to accept invitation');
    }
    const data = await res.json();
    return data.conversation;
  },

  // Recipient declines invitation
  async declineInvitation(idOrToken: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(idOrToken)}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to decline invitation');
    }
    const data = await res.json();
    return data.conversation;
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    payload: {
      senderId: string;
      senderName: string;
      text: string;
      wasMediated: boolean;
      originalDraft?: string;
    }
  ): Promise<{ message: Message; conversation: Conversation }> {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete conversation');
    }
  },

  // Reset data to defaults
  async resetData(): Promise<void> {
    const res = await fetch('/api/reset-data', {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error('Failed to reset data');
    }
  },

  // Analyze message draft using AI Mediator
  async analyzeDraft(params: {
    draft: string;
    conversationContext?: string;
    senderName?: string;
    recipientName?: string;
  }): Promise<MediatorAnalysisResponse> {
    const res = await fetch('/api/mediator/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze draft with AI');
    }
    return res.json();
  },
};
