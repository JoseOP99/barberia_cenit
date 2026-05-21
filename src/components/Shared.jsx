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
