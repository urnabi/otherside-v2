import React from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#ECE7DF] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ECE7DF] flex items-center justify-between bg-white/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBF3EE] text-[#477053] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-[#252830]">
                Android App Installation
              </h3>
              <span className="text-[11px] text-[#787F90] block">
                Run natively on your Android device
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-[#4F5566] leading-relaxed">
          {isInstalled ? (
            <div className="p-4 bg-[#EBF3EE] border border-[#CDE0D3] rounded-2xl flex items-center gap-3 text-[#36573F]">
              <CheckCircle2 className="w-5 h-5 text-[#477053] shrink-0" />
              <div>
                <strong className="block font-semibold">Already Installed!</strong>
                <span>THE OTHER SIDE is running as an Android standalone app on this device.</span>
              </div>
            </div>
          ) : (
            <>
              {/* Direct Native Install Button */}
              <div className="p-4 bg-white border border-[#D5E4D8] rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#36573F] font-semibold text-xs uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-[#477053]" />
                  <span>1-Tap Android App Installation</span>
                </div>

                <p className="text-xs text-[#52596B]">
                  Install THE OTHER SIDE directly to your Android Home Screen and App Drawer. Runs full-screen with offline caching and native app performance.
                </p>

                <button
                  onClick={handleInstallClick}
                  disabled={!isInstallable}
                  className="w-full py-3 px-4 bg-[#36573F] hover:bg-[#2B4732] disabled:bg-[#7E8B81] text-white rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isInstallable ? 'Install to Android Device' : 'Install Ready in Chrome Menu'}
                  </span>
                </button>
              </div>

              {/* Manual Chrome Android Steps */}
              <div className="p-3.5 bg-white/70 border border-[#ECE7DF] rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-[#252830]">
                  Installing on Android (Chrome or Samsung Internet):
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[#52596B] pl-1">
                  <li>Tap the <strong>three dots menu (⋮)</strong> at top right in Chrome.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm <strong>"Install"</strong>. The app icon will appear in your Android launcher.</li>
                </ol>
              </div>
            </>
          )}

          {/* Android Features checklist */}
          <div className="p-3 bg-white/60 border border-[#ECE7DF] rounded-xl space-y-1.5 text-xs">
            <span className="font-semibold text-[#252830] block text-[11px] uppercase tracking-wider">
              Android Native Capabilities:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#555C6E]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#477053]" />
                <span>Standalone Fullscreen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#477053]" />
                <span>Android Contact Picker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#477053]" />
                <span>Android Share Sheet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#477053]" />
                <span>Maskable App Icon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
