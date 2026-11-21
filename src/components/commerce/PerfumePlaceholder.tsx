export function PerfumePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-placeholder ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 96 96"
        className="h-1/3 w-1/3 min-h-16 min-w-16 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 12h16" />
        <path d="M43 12v12h10V12" />
        <path d="M35 29h26" />
        <path d="M31 39c0-5.5 4.5-10 10-10h14c5.5 0 10 4.5 10 10v35c0 5.5-4.5 10-10 10H41c-5.5 0-10-4.5-10-10V39Z" />
        <path d="M39 50h18" />
        <path d="M39 59h18" />
        <path d="M67 34h8" />
        <path d="M72 29v10" />
      </svg>
    </div>
  );
}
