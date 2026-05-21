import React from 'react';
import * as LucideIcons from 'lucide-react';

export const Icon = ({ name, size = 18, className = "", strokeWidth = 1.5, ...rest }) => {
  const LucideIcon = LucideIcons[name];
  if (!LucideIcon) return <span className={className} {...rest} />;
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} {...rest} />;
};

export const CenitMark = ({ size = 56, className = "" }) => (
  <img src="/Logo.png" alt="Cénitt Logo" style={{ width: size, height: 'auto', objectFit: 'contain' }} className={className} />
);

export const Logo = ({ size = 36, showText = true, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <CenitMark size={size} />
    {showText && (
      <div className="leading-none">
        <div className="font-display text-xl tracking-[0.18em]" style={{ color: '#E8C77E' }}>CÉNITT</div>
        <div className="text-[9px] tracking-[0.32em] mt-1" style={{ color: '#8A857A' }}>BARBERÍA · EST. MMXXIV</div>
      </div>
    )}
  </div>
);

export const Eyebrow = ({ children, left = false }) => (
  <span className={`eyebrow ${left ? 'left' : ''}`}>{children}</span>
);

export const Crest = ({ size = 100, className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <CenitMark size={size} />
  </div>
);

export const Corners = () => (
  <>
    <span className="crest-bl"></span><span className="crest-br"></span>
  </>
);

export const Sunburst = ({ size = 24 }) => (
  <Icon name="Sun" size={size} style={{ color: '#C9A86A' }} />
);

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const toRoman = (num) => {
  // Simplificado para este uso
  return "MMXXVI";
};
export const romanDate = (date) => {
  return "XX.V.MMXXVI";
};
