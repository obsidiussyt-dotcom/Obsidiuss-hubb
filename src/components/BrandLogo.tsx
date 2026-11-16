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
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="55%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={frameGrad} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id={facetTopLeft} x1="16" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id={facetTopRight} x1="32" y1="10" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id={facetBotLeft} x1="16" y1="32" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={facetBotRight} x1="32" y1="32" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id={coreGrad} x1="26" y1="24" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Housing */}
      <path
        d="M32 3L57 17.5V46.5L32 61L7 46.5V17.5L32 3Z"
        fill={`url(#${bgGrad})`}
        stroke={`url(#${frameGrad})`}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Inner Architectural Chamfer Ring */}
      <path
        d="M32 7.5L53 19.6V44.4L32 56.5L11 44.4V19.6L32 7.5Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Faceted Crystal Monolith */}
      <polygon points="32,12 17,32 32,26" fill={`url(#${facetTopLeft})`} />
      <polygon points="32,12 47,32 32,26" fill={`url(#${facetTopRight})`} />
      <polygon points="17,32 32,52 32,38" fill={`url(#${facetBotLeft})`} />
      <polygon points="47,32 32,52 32,38" fill={`url(#${facetBotRight})`} />

      {/* Left & Right Wing Ridges */}
      <polygon points="17,32 32,26 26,32" fill="rgba(255,255,255,0.35)" />
      <polygon points="47,32 32,26 38,32" fill="rgba(249,115,22,0.38)" />

      {/* Specular Precision Core Diamond */}
      <polygon points="32,23 39,32 32,41 25,32" fill={`url(#${coreGrad})`} />
      <polygon points="32,26.5 36,32 32,37.5 28,32" fill="#0f172a" />
      <polygon points="32,29 34,32 32,35 30,32" fill="#ffffff" />

      {/* Top/Bottom Razor Edge Specular Accent */}
      <path
        d="M32 12V23M32 41V52"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
