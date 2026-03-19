"use client";

export default function DashboardHeroArt() {
  return (
    <div className="relative">
      <div
        className={[
          "pointer-events-none absolute -top-10 left-1/2 h-56 w-[520px] -translate-x-1/2",
          "bg-[radial-gradient(closest-side,rgba(99,102,241,0.22),transparent_70%)]",
        ].join(" ")}
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute -right-16 -top-2 opacity-20"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M28 92C47 52 79 32 117 34C150 36 166 67 150 97C135 125 103 136 72 128C44 121 18 126 28 92Z"
          stroke="url(#g)"
          strokeWidth="4"
        />
        <path
          d="M56 108C64 91 82 78 103 78C125 78 136 94 131 110C126 126 107 131 91 128C75 125 48 125 56 108Z"
          stroke="url(#g)"
          strokeWidth="3"
        />
        <defs>
          <linearGradient id="g" x1="28" y1="30" x2="156" y2="152" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

