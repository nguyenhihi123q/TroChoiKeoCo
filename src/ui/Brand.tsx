// Nhận diện thương hiệu tự thiết kế cho ứng dụng (không sao chép nơi khác).
import type { ReactNode } from 'react';

export function BrandLogo({ size = 46 }: { size?: number }) {
  return (
    <svg
      className="brand-logo"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Biểu tượng Kéo co kiến thức"
    >
      <rect width="64" height="64" rx="14" fill="#0d9488" />
      <path
        d="M6 32 H58"
        stroke="#f8fafc"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <circle cx="32" cy="32" r="7" fill="#facc15" stroke="#fff" strokeWidth="2" />
      <rect x="9" y="20" width="12" height="9" rx="2" fill="#2563eb" />
      <rect x="43" y="20" width="12" height="9" rx="2" fill="#dc2626" />
      <path
        d="M20 46 q12 -8 24 0"
        fill="none"
        stroke="#a7f3d0"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppBar({ subtitle, right }: { subtitle?: string; right?: ReactNode }) {
  return (
    <header className="appbar">
      <div className="brand">
        <BrandLogo />
        <div>
          <h1>Kéo co kiến thức</h1>
          {subtitle && <small>{subtitle}</small>}
        </div>
      </div>
      {right && <div className="row">{right}</div>}
    </header>
  );
}
