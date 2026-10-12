const paths: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  heart: <path d="M12 20s-7-4.4-9.2-8.6C1.3 8.3 3 4.5 6.6 4.5c2 0 3.4 1.1 4.4 2.6h2c1-1.5 2.4-2.6 4.4-2.6 3.6 0 5.3 3.8 3.8 6.9C19 15.6 12 20 12 20Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  book: <path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4zM5 16a4 4 0 0 1 4-4h10" />,
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 11h10.2L20 8H6.2" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3 2 3.5 5" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2" />
      <rect x="7" y="14" width="10" height="6" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 12 5 5 9-10" />,
  leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z" />,
  flame: <path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s0 2 2 2c0-3-1-5 1-8Z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v11" />
    </>
  ),
  activity: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  pill: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)" />
      <path d="m9.5 9.5 5 5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 13h18" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  alert: <path d="M12 4 2.5 20h19zM12 10v4M12 17h.01" />,
  swap: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  bowl: <path d="M3 11h18a9 9 0 0 1-18 0ZM8 20h8M12 4c-1 2 1 3 0 5" />,
};

export function Icon({ name, size = 20, className, label }: { name: keyof typeof paths | string; size?: number; className?: string; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      {paths[name] ?? paths.info}
    </svg>
  );
}

/** Brand mark: forest-green disc (#0A2610) with a midnight-violet ring (#1f0e2f) and a leaf. */
export function LogoMark({ size = 30, inverted = false }: { size?: number; inverted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="14.6" fill="#0A2610" stroke={inverted ? "#f4efed" : "#1f0e2f"} strokeWidth="2.2" />
      <path d="M9 21c0-7 4.5-11.5 14-11.5 0 9-5.5 13-12.5 13" fill="none" stroke="#f4efed" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 22.5 17 15" stroke="#fde3d8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Full logo: mark + wordmark with a bold "Nourish" and a regular-weight "Well". */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <>
      <LogoMark inverted={inverted} />
      <span className="logo-word">
        <span className="logo-nourish">Nourish</span>
        <span className="logo-well">Well</span>
      </span>
    </>
  );
}
