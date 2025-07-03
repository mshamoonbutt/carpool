import * as React from "react";

export function UniPoolLogo({ className = "", size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* U as a car silhouette with wheels */}
      <path
        d="M10 22c0 8 12 12 14 0"
        stroke="url(#up-gradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Car roof (U top) */}
      <path
        d="M14 18c2-4 12-4 14 0"
        stroke="url(#up-gradient)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Wheels */}
      <circle cx="16" cy="28" r="2.2" fill="url(#up-gradient)" />
      <circle cx="28" cy="28" r="2.2" fill="url(#up-gradient)" />
      {/* P as a location pin with a pool */}
      <path
        d="M34 14c4 0 6 3 6 6 0 5-6 10-6 10s-6-5-6-10c0-3 2-6 6-6z"
        stroke="url(#up-gradient)"
        strokeWidth="2.2"
        fill="none"
      />
      <circle cx="34" cy="20" r="2" fill="url(#up-gradient)" />
      {/* Pool under pin */}
      <ellipse
        cx="34"
        cy="30"
        rx="4.5"
        ry="1.5"
        fill="url(#pool-gradient)"
        opacity="0.7"
      />
      {/* Connection arc between car and pin */}
      <path
        d="M24 24 Q29 26 34 24"
        stroke="url(#up-gradient)"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="up-gradient" x1="10" y1="12" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F2B96" />
          <stop offset="1" stopColor="#A8C0FF" />
        </linearGradient>
        <linearGradient id="pool-gradient" x1="30" y1="30" x2="38" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A8C0FF" />
          <stop offset="1" stopColor="#3F2B96" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default UniPoolLogo; 