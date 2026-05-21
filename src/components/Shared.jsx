import React from 'react';
import * as LucideIcons from 'lucide-react';

export const Icon = ({ name, size = 18, className = '', strokeWidth = 1.5, ...rest }) => {
  const LucideIcon = LucideIcons[name];
  if (!LucideIcon) return <span className={className} {...rest} />;
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} {...rest} />;
};

export const Logo = ({ size = 40, showText = true, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img src="/Logo.png" alt="Cénit" style={{ width: size, height: 'auto' }} />
    {showText && (
      <div className="leading-none">
        <div className="text-lg font-semibold tracking-[0.12em] text-[#E8C77E]">CÉNIT</div>
        <div className="text-[9px] tracking-[0.2em] text-[#6A655C] mt-0.5">BARBERÍA</div>
      </div>
    )}
  </div>
);

export const Corners = () => (
  <>
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8B6F3F]/50"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#8B6F3F]/50"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#8B6F3F]/50"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#8B6F3F]/50"></div>
  </>
);

export const Sunburst = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L12 6M12 18L12 22M4.92893 4.92893L7.75736 7.75736M16.2426 16.2426L19.0711 19.0711M2 12H6M18 12H22M4.92893 19.0711L7.75736 16.2426M16.2426 7.75736L19.0711 4.92893" stroke="#C9A86A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="#C9A86A" strokeWidth="1.5"/>
  </svg>
);
