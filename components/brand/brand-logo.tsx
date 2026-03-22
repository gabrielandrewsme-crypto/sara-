type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className={`brand-mark${compact ? " brand-mark--compact" : ""}`} aria-label="Sara">
      <div className="brand-mark__badge">
        <svg
          className="brand-mark__symbol"
          viewBox="0 0 320 320"
          role="img"
          aria-hidden="true"
        >
          <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round">
            <ellipse cx="160" cy="93" rx="118" ry="104" />
            <ellipse cx="160" cy="227" rx="118" ry="104" />
            <ellipse cx="160" cy="160" rx="128" ry="58" />
            <circle cx="160" cy="160" r="37" />
          </g>
        </svg>
      </div>
      <div>
        <strong>Sara</strong>
        <small>sistema mental</small>
      </div>
    </div>
  );
}
