import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface WelcomeScreenProps {
  onStart: (userName: string) => void;
  defaultUserName: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, defaultUserName }) => {
  const handleStart = () => {
    onStart(defaultUserName || 'You');
  };

  return (
    <div className="min-h-full flex-1 flex flex-col justify-between p-6 max-w-md mx-auto text-[#252830]">
      {/* Top spacing & ambient header */}
      <div className="my-auto py-8 text-center flex flex-col items-center">
        <div className="mb-6 p-5 bg-gradient-to-b from-[#F2F0F9] to-white rounded-3xl shadow-sm border border-[#E9E5F2] flex items-center justify-center">
          <BrandLogo size="xl" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#ECEAF5] text-[#5A5084] rounded-full text-xs font-semibold tracking-wide uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#7C72A8]" />
          AI-Mediated Communication
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#22252E] mb-3 leading-tight">
          THE OTHER SIDE
        </h1>

        <p className="font-serif italic text-lg sm:text-xl text-[#585E70] max-w-xs mx-auto">
          “Say what you mean. Understand what they hear.”
        </p>
      </div>

      {/* Start Button */}
      <div className="pb-6 pt-2">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 bg-[#252830] hover:bg-[#343844] text-[#FAF8F5] rounded-2xl font-medium text-base shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 group active:scale-[0.99]"
        >
          <span>Start</span>
          <ArrowRight className="w-4 h-4 text-[#C1BAE1] transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-center text-[11px] text-[#868D9F] mt-3">
          Calm, neutral, and emotionally supportive.
        </p>
      </div>
    </div>
  );
};
