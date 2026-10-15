export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-full bg-gold px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to main content
    </a>
  );
}
