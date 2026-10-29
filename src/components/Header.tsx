import React from 'react';
import { ArrowLeft, Sparkles, Settings2, Smartphone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  title?: string;
  subtitle?: string;
  onOpenSettings?: () => void;
  onOpenAndroidInstall?: () => void;
  showMediatorPill?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  title,
  subtitle,
  onOpenSettings,
  onOpenAndroidInstall,
  showMediatorPill = true,
}) => {
  const isRoot = currentScreen === 'welcome' || currentScreen === 'home';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#ECE7DF] px-4 py-3 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left side: Back or Logo */}
        <div className="flex items-center gap-2.5">
          {!isRoot ? (
            <button
              onClick={() => onNavigate('home')}
              className="p-2 -ml-1 text-[#4A5060] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors active:scale-95"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <BrandLogo size="sm" />
          )}

          <div className="flex flex-col">
            <h1 className="font-serif font-medium text-base text-[#252830] tracking-tight leading-tight">
              {title || 'THE OTHER SIDE'}
            </h1>
            {subtitle && (
              <span className="text-xs text-[#737A8C] truncate max-w-[200px]">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Android App, AI Mediator status pill & Settings */}
        <div className="flex items-center gap-1.5">
          {onOpenAndroidInstall && (
            <button
              onClick={onOpenAndroidInstall}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#EBF3EE] hover:bg-[#DFEDE3] text-[#36573F] rounded-full text-[11px] font-semibold border border-[#CDE0D3] transition-colors"
              title="Install Android App / Build APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#477053]" />
              <span className="hidden xs:inline">Android App</span>
            </button>
          )}

          {showMediatorPill && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F0EEF8] text-[#5D5387] rounded-full text-[11px] font-medium border border-[#DDD8EE]"
              title="The AI Mediator is active to help you reframe drafts before sending"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C72A8] animate-pulse" />
              <span>Mediator Active</span>
            </div>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 text-[#606778] hover:text-[#252830] hover:bg-[#EFECE6] rounded-full transition-colors active:scale-95"
              title="Settings & Mediator principles"
              aria-label="Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
