export function BrandLogo() {
  return (
    <div className="brand-mark" aria-label="Sara">
      <svg
        className="brand-mark__symbol"
        viewBox="0 0 240 180"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ringBase" x1="20" y1="10" x2="220" y2="170">
            <stop offset="0%" stopColor="#312857" />
            <stop offset="55%" stopColor="#5f5a8f" />
            <stop offset="100%" stopColor="#2a2348" />
          </linearGradient>
          <linearGradient id="ringGlow" x1="35" y1="20" x2="200" y2="150">
            <stop offset="0%" stopColor="#89d7ff" />
            <stop offset="55%" stopColor="#d09aff" />
            <stop offset="100%" stopColor="#8f7cff" />
          </linearGradient>
          <radialGradient id="pearl" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#f5efff" />
            <stop offset="55%" stopColor="#bcb0ef" />
            <stop offset="100%" stopColor="#766bb0" />
          </radialGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse
            cx="78"
            cy="86"
            rx="57"
            ry="63"
            stroke="url(#ringBase)"
            strokeWidth="16"
            transform="rotate(-18 78 86)"
          />
          <ellipse
            cx="126"
            cy="82"
            rx="57"
            ry="63"
            stroke="url(#ringBase)"
            strokeWidth="16"
            transform="rotate(16 126 82)"
          />
          <ellipse
            cx="171"
            cy="92"
            rx="54"
            ry="47"
            stroke="url(#ringBase)"
            strokeWidth="16"
            transform="rotate(19 171 92)"
          />

          <path
            d="M107 28a59 65 0 0 1 47 16"
            stroke="url(#ringGlow)"
            strokeWidth="2.8"
            filter="url(#softGlow)"
          />
          <path
            d="M62 147a58 64 0 0 1-24-20"
            stroke="url(#ringGlow)"
            strokeWidth="2.8"
            filter="url(#softGlow)"
          />
          <path
            d="M109 136a59 66 0 0 1-15-84"
            stroke="url(#ringGlow)"
            strokeWidth="2.8"
            filter="url(#softGlow)"
          />
          <path
            d="M173 58a52 45 0 0 1 28 25"
            stroke="url(#ringGlow)"
            strokeWidth="2.6"
            filter="url(#softGlow)"
          />
        </g>

        <circle cx="125" cy="76" r="8.5" fill="url(#pearl)" />
        <circle cx="108" cy="112" r="8.5" fill="url(#pearl)" />
      </svg>
      <div>
        <strong>Sara</strong>
        <small>sistema mental</small>
      </div>
    </div>
  );
}
