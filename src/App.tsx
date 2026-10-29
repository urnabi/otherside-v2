/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Conversation, ScreenType, MediatorAnalysisResponse } from './types';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { NewChatModal } from './components/NewChatModal';
import { InvitationView } from './components/InvitationView';
import { SettingsModal } from './components/SettingsModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string>('user-me');
  const [userName, setUserName] = useState<string>('You');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isNewChatOpen, setIsNewChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState<boolean>(false);
  const [invitationConv, setInvitationConv] = useState<Conversation | null>(null);

  // Check URL query parameters for invite tokens on initial mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const inviteToken = searchParams.get('invite');

    loadConversations().then((loadedConvs) => {
      if (inviteToken) {
        const matchingConv = loadedConvs.find(
          (c) => c.inviteToken === inviteToken || c.id === inviteToken
        );
        if (matchingConv) {
          setInvitationConv(matchingConv);
          // Set active user as the invited participant for testing recipient view
          const invitedP = matchingConv.participants.find((p) => p.role === 'invited');
          if (invitedP) {
            setActiveUserId(invitedP.id);
            setUserName(invitedP.name);
          }
          setCurrentScreen('invitation');
        }
      }
    });
  }, []);

  const loadConversations = async (): Promise<Conversation[]> => {
    try {
      setIsLoading(true);
      const list = await api.getConversations();
      setConversations(list);
      return list;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome -> Home
  const handleStartFromWelcome = (chosenName: string) => {
    setUserName(chosenName);
    setCurrentScreen('home');
  };

  // Open Conversation
  const handleOpenConversation = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;

    if (conv.status === 'pending') {
      // If pending, show invitation view to allow recipient acceptance
      setInvitationConv(conv);
      setCurrentScreen('invitation');
    } else {
      setActiveConvId(convId);
      // Ensure activeUserId matches a participant
      const p = conv.participants.find((part) => part.id === activeUserId);
      if (!p) {
        setActiveUserId(conv.participants[0].id);
      }
      setCurrentScreen('chat');
    }
  };

  // Create new conversation
  const handleCreateConversation = async (params: {
    recipientName: string;
    phoneOrEmail?: string;
    topicContext?: string;
  }): Promise<Conversation> => {
    const newConv = await api.createConversation({
      ...params,
      creatorName: userName,
    });
    setConversations((prev) => [newConv, ...prev]);
    return newConv;
  };

  // Recipient accepts invitation
  const handleAcceptInvitation = async (conv: Conversation) => {
    try {
      const updated = await api.acceptInvitation(conv.id);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setActiveConvId(updated.id);
      // Recipient is the invited user
      const invitedP = updated.participants.find((p) => p.role === 'invited') || updated.participants[1];
      setActiveUserId(invitedP.id);
      setCurrentScreen('chat');
    } catch (err: any) {
      console.error('Accept error:', err);
      throw err;
    }
  };

  // Recipient declines invitation
  const handleDeclineInvitation = async (conv: Conversation) => {
    try {
      const updated = await api.declineInvitation(conv.id);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setCurrentScreen('home');
    } catch (err: any) {
      console.error('Decline error:', err);
      throw err;
    }
  };

  // Send message
  const handleSendMessage = async (
    text: string,
    wasMediated: boolean,
    originalDraft?: string
  ) => {
    if (!activeConvId) return;
    const currentConv = conversations.find((c) => c.id === activeConvId);
    const sender = currentConv?.participants.find((p) => p.id === activeUserId);

    const { message, conversation: updatedConv } = await api.sendMessage(activeConvId, {
      senderId: activeUserId,
      senderName: sender?.name || userName,
      text,
      wasMediated,
      originalDraft,
    });

    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
    );
  };

  // Call AI Mediator on draft
  const handleAnalyzeDraft = async (draft: string): Promise<MediatorAnalysisResponse> => {
    const currentConv = conversations.find((c) => c.id === activeConvId);
    const sender = currentConv?.participants.find((p) => p.id === activeUserId);
    const other = currentConv?.participants.find((p) => p.id !== activeUserId);

    return await api.analyzeDraft({
      draft,
      conversationContext: currentConv?.topicContext || currentConv?.title,
      senderName: sender?.name || userName,
      recipientName: other?.name || 'Recipient',
    });
  };

  // Delete / leave conversation
  const handleDeleteConversation = async (convId: string) => {
    await api.deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    setActiveConvId(null);
    setCurrentScreen('home');
  };

  // Reset sample data
  const handleResetData = async () => {
    await api.resetData();
    await loadConversations();
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="min-h-screen bg-[#F3F0EA] flex justify-center selection:bg-[#7C72A8]/20 selection:text-[#252830]">
      {/* Mobile-first Android viewport container */}
      <div className="w-full max-w-md bg-[#FAF8F5] min-h-screen flex flex-col shadow-xl border-x border-[#ECE7DF] relative">
        {/* Navigation Header */}
        {currentScreen !== 'chat' && (
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
            title={
              currentScreen === 'welcome'
                ? 'THE OTHER SIDE'
                : currentScreen === 'home'
                ? 'Older Chats'
                : 'Invitation'
            }
            subtitle={
              currentScreen === 'welcome'
                ? 'AI Communication Mediator'
                : currentScreen === 'home'
                ? `Logged in as ${userName}`
                : undefined
            }
            showMediatorPill={currentScreen !== 'welcome'}
          />
        )}

        {/* Screen Switcher */}
        <main className="flex-1 flex flex-col">
          {currentScreen === 'welcome' && (
            <WelcomeScreen
              defaultUserName={userName}
              onStart={handleStartFromWelcome}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              conversations={conversations}
              activeUserId={activeUserId}
              onOpenConversation={handleOpenConversation}
              onStartNewChat={() => setIsNewChatOpen(true)}
              onRefresh={loadConversations}
              isLoading={isLoading}
              onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
            />
          )}

          {currentScreen === 'chat' && activeConversation && (
            <ChatScreen
              conversation={activeConversation}
              activeUserId={activeUserId}
              onBackToHome={() => setCurrentScreen('home')}
              onSendMessage={handleSendMessage}
              onAnalyzeDraft={handleAnalyzeDraft}
              onSwitchActiveParticipant={(newId) => setActiveUserId(newId)}
              onDeleteConversation={handleDeleteConversation}
              onOpenInvitation={() => {
                setInvitationConv(activeConversation);
                setCurrentScreen('invitation');
              }}
            />
          )}

          {currentScreen === 'invitation' && invitationConv && (
            <InvitationView
              conversation={invitationConv}
              onAccept={handleAcceptInvitation}
              onDecline={handleDeclineInvitation}
              onReturnHome={() => setCurrentScreen('home')}
            />
          )}
        </main>

        {/* Modals */}
        <NewChatModal
          isOpen={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
          onCreateConversation={handleCreateConversation}
          creatorName={userName}
          onOpenInvitationView={(conv) => {
            setInvitationConv(conv);
            setCurrentScreen('invitation');
          }}
          onOpenConversation={(convId) => {
            handleOpenConversation(convId);
          }}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onResetData={handleResetData}
          userName={userName}
          onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
        />

        <AndroidInstallModal
          isOpen={isAndroidInstallOpen}
          onClose={() => setIsAndroidInstallOpen(false)}
        />

        {/* Offline Connectivity Notification */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
