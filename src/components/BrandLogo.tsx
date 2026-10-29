import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${sizeClasses} flex items-center justify-center shrink-0`}>
        {/* Two overlapping organic circles representing the two sides of a conversation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#7C72A8]/80 to-[#9D94C4]/90 rounded-full blur-[1px] transform -translate-x-1.5 opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#63856D]/80 to-[#87A890]/90 rounded-full blur-[1px] transform translate-x-1.5 opacity-85 mix-blend-multiply" />
        
        {/* Harmonious center aperture */}
        <div className="relative z-10 w-2/5 h-2/5 bg-[#FAF8F5] rounded-full shadow-inner flex items-center justify-center border border-white/60">
          <div className="w-1.5 h-1.5 bg-[#4B456B] rounded-full" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-semibold tracking-wider text-xs uppercase text-[#7C72A8]">
            Communication Mediator
          </span>
          <span className="font-serif tracking-tight text-lg text-[#252830] font-medium -mt-0.5">
            THE OTHER SIDE
          </span>
        </div>
      )}
    </div>
  );
};
