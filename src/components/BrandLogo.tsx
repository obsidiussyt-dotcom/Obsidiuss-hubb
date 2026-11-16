import React, { useId } from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  className = '',
  animate = true,
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, '');

  const frameGrad = `obs-frame-${uid}`;
  const bgGrad = `obs-bg-${uid}`;
  const coreGrad = `obs-core-${uid}`;
  const haloGrad = `obs-halo-${uid}`;
  const facetTL = `obs-ftl-${uid}`;
  const facetTR = `obs-ftr-${uid}`;
  const facetBL = `obs-fbl-${uid}`;
  const facetBR = `obs-fbr-${uid}`;

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
        {/* Dynamic Multi-stop Gradients */}
        <linearGradient id={bgGrad} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a0f1d" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id={frameGrad} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        <linearGradient id={haloGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id={facetTL} x1="16" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>

        <linearGradient id={facetTR} x1="32" y1="10" x2="48" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id={facetBL} x1="16" y1="32" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id={facetBR} x1="32" y1="32" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        <linearGradient id={coreGrad} x1="26" y1="24" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {animate && (
          <style>{`
            @keyframes obs-spin-${uid} {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes obs-pulse-${uid} {
              0%, 100% { transform: scale(1); opacity: 0.95; }
              50% { transform: scale(1.12); opacity: 1; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9)); }
            }
            @keyframes obs-shimmer-${uid} {
              0%, 100% { opacity: 0.3; transform: scale(0.96); }
              50% { opacity: 0.9; transform: scale(1.04); }
            }
            .obs-core-anim-${uid} {
              transform-origin: 32px 32px;
              animation: obs-pulse-${uid} 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .obs-orbit-anim-${uid} {
              transform-origin: 32px 32px;
              animation: obs-spin-${uid} 22s linear infinite;
            }
            .obs-ring-anim-${uid} {
              transform-origin: 32px 32px;
              animation: obs-shimmer-${uid} 4s ease-in-out infinite;
            }
          `}</style>
        )}
      </defs>

      {/* Pulsing Ambient Background Glow Ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={`url(#${haloGrad})`}
        strokeWidth="1.2"
        strokeDasharray="4 6"
        className={animate ? `obs-orbit-anim-${uid}` : ''}
        opacity="0.6"
      />

      {/* Outer Hexagonal Shield Housing */}
      <path
        d="M32 3.5L56.5 17.6V46.4L32 60.5L7.5 46.4V17.6L32 3.5Z"
        fill={`url(#${bgGrad})`}
        stroke={`url(#${frameGrad})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Internal Architectural Hex Edge */}
      <path
        d="M32 8L52 19.5V44.5L32 56L12 44.5V19.5L32 8Z"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
        strokeLinejoin="round"
        className={animate ? `obs-ring-anim-${uid}` : ''}
      />

      {/* Faceted Crystal Monolith */}
      <g>
        {/* Top-Left Facet */}
        <polygon points="32,13 18,32 32,26" fill={`url(#${facetTL})`} opacity="0.95" />
        {/* Top-Right Facet */}
        <polygon points="32,13 46,32 32,26" fill={`url(#${facetTR})`} opacity="0.9" />
        {/* Bottom-Left Facet */}
        <polygon points="18,32 32,51 32,38" fill={`url(#${facetBL})`} opacity="0.95" />
        {/* Bottom-Right Facet (Vibrant Pink/Orange Flare) */}
        <polygon points="46,32 32,51 32,38" fill={`url(#${facetBR})`} opacity="0.9" />

        {/* Wing Accents */}
        <polygon points="18,32 32,26 26,32" fill="rgba(255,255,255,0.4)" />
        <polygon points="46,32 32,26 38,32" fill="rgba(249,115,22,0.45)" />
      </g>

      {/* Specular Pulsing Core Diamond */}
      <g className={animate ? `obs-core-anim-${uid}` : ''}>
        <polygon points="32,23 39,32 32,41 25,32" fill={`url(#${coreGrad})`} />
        <polygon points="32,26 36,32 32,38 28,32" fill="#0f172a" opacity="0.9" />
        <polygon points="32,28.5 34.5,32 32,35.5 29.5,32" fill="#ffffff" />
      </g>

      {/* Razor Specular Reflection Spine */}
      <path
        d="M32 13V23M32 41V51"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};
