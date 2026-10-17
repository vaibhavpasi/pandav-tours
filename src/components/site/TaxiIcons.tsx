// Inline stroke icons for the cab booking UI, matching the 24px / 1.8 stroke
// style of components/layout/Icons.tsx.
type IconProps = { className?: string };

function Stroke({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 16H3.5a1 1 0 0 1-1-1v-3.2a1 1 0 0 1 .6-.9L5 10l2-4.2A1.5 1.5 0 0 1 8.4 5h7.2a1.5 1.5 0 0 1 1.4.8L19 10l1.9.9a1 1 0 0 1 .6.9V15a1 1 0 0 1-1 1H19" />
      <path d="M5 10h14M9 16h6" />
      <circle cx="7" cy="16.5" r="2" />
      <circle cx="17" cy="16.5" r="2" />
    </Stroke>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Stroke>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Stroke>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Stroke>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6" />
    </Stroke>
  );
}

export function ReceiptIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Stroke>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </Stroke>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19c0 1.5-1.5 2.5-4 2.5h-2" />
    </Stroke>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Stroke>
  );
}

export function PlaneIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
    </Stroke>
  );
}

export function TrainIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="5" y="3" width="14" height="14" rx="3" />
      <path d="M5 10h14M9 14h.01M15 14h.01M8 21l2-4M16 21l-2-4" />
    </Stroke>
  );
}

export function RoundTripIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5" />
    </Stroke>
  );
}

export function TempleIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 2.5v2M8 9.5 12 4.5l4 5M6 9.5h12M7 9.5v10M17 9.5v10M4 19.5h16M10.5 19.5v-4a1.5 1.5 0 0 1 3 0v4" />
    </Stroke>
  );
}

export function BedIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" />
      <circle cx="7" cy="11" r="2" />
    </Stroke>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </Stroke>
  );
}
