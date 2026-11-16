import React, { useId } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 36, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const frameGrad = `obs-frame-${uid}`;
  const bgGrad = `obs-bg-${uid}`;
  const facetTopLeft = `obs-ftl-${uid}`;
  const facetTopRight = `obs-ftr-${uid}`;
  const facetBotLeft = `obs-fbl-${uid}`;
  const facetBotRight = `obs-fbr-${uid}`;
  const coreGrad = `obs-core-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bgGrad} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090a14" />
          <stop offset="100%" stopColor="#121428" />
        </linearGradient>
        <linearGradient id={frameGrad} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={facetTopLeft} x1="16" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id={facetTopRight} x1="32" y1="10" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={facetBotLeft} x1="16" y1="32" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id={facetBotRight} x1="32" y1="32" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id={coreGrad} x1="26" y1="24" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Obsidian Housing */}
      <path
        d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z"
        fill={`url(#${bgGrad})`}
        stroke={`url(#${frameGrad})`}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Inner Architectural Chamfer Ring */}
      <path
        d="M32 7.5L53 19.6V44.4L32 56.5L11 44.4V19.6L32 7.5Z"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Faceted Obsidian Crystal Monolith */}
      <polygon points="32,12 17,32 32,26" fill={`url(#${facetTopLeft})`} />
      <polygon points="32,12 47,32 32,26" fill={`url(#${facetTopRight})`} />
      <polygon points="17,32 32,52 32,38" fill={`url(#${facetBotLeft})`} />
      <polygon points="47,32 32,52 32,38" fill={`url(#${facetBotRight})`} />

      {/* Left & Right Wing Ridges */}
      <polygon points="17,32 32,26 26,32" fill="rgba(255,255,255,0.22)" />
      <polygon points="47,32 32,26 38,32" fill="rgba(6,182,212,0.35)" />

      {/* Specular Precision Core Diamond */}
      <polygon
        points="32,23 39,32 32,41 25,32"
        fill={`url(#${coreGrad})`}
      />
      <polygon
        points="32,26.5 36,32 32,37.5 28,32"
        fill="#070810"
      />
      <polygon
        points="32,29 34,32 32,35 30,32"
        fill="#ffffff"
      />

      {/* Top/Bottom Razor Edge Specular Accent */}
      <path
        d="M32 12V23M32 41V52"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
