import React from 'react';

export function CapVisual({ color = "#1A1816", accent = "#C9A86A", style = "snapback" }) {
  return (
    <svg viewBox="0 0 200 140" className="cap-silhouette w-[70%] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <defs>
        <linearGradient id={`cap-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".95"/>
          <stop offset="100%" stopColor="#000" stopOpacity=".9"/>
        </linearGradient>
      </defs>
      <path d="M40,80 C40,40 70,20 100,20 C130,20 160,40 160,80 L160,90 L40,90 Z"
            fill={`url(#cap-${color.replace('#','')})`} stroke="#000" strokeWidth=".5"/>
      <ellipse cx="105" cy="100" rx="85" ry="10" fill="#0A0A0A" stroke={color} strokeWidth=".5"/>
      <line x1="100" y1="22" x2="100" y2="88" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      <path d="M40,80 Q100,60 160,80" fill="none" stroke="#000" strokeOpacity=".3" strokeWidth=".5"/>
      <g transform="translate(100,55)">
        <circle r="14" fill="none" stroke={accent} strokeWidth=".8" opacity=".9"/>
        <path d="M-8,4 L-2,-6 L0,-2 L4,-8 L8,4 Z" fill="none" stroke={accent} strokeWidth=".8"/>
        <text y="14" textAnchor="middle" fontSize="5" fill={accent}
              fontFamily="Cormorant Garamond" letterSpacing="1">CÉNITT</text>
      </g>
      {style === 'snapback' && (
        <rect x="180" y="78" width="14" height="14" fill="#0A0A0A" stroke={accent} strokeWidth=".5"/>
      )}
    </svg>
  );
}
