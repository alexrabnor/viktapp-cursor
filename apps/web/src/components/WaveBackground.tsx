"use client";

export default function WaveBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* white base */}
      <div className="absolute inset-0 bg-white" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* wave 1 – thick pale wave */}
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#bae6fd" stopOpacity="0.0" />
            <stop offset="30%"  stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="70%"  stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
          {/* wave 2 – dark core */}
          <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0284c7" stopOpacity="0.0" />
            <stop offset="35%"  stopColor="#0369a1" stopOpacity="0.60" />
            <stop offset="65%"  stopColor="#0284c7" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
          {/* wave 3 – thin bright ribbon */}
          <linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.0" />
            <stop offset="40%"  stopColor="#7dd3fc" stopOpacity="0.70" />
            <stop offset="60%"  stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.0" />
          </linearGradient>
          {/* wave 4 – wide pale fill */}
          <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#e0f2fe" stopOpacity="0.0" />
            <stop offset="25%"  stopColor="#bae6fd" stopOpacity="0.40" />
            <stop offset="75%"  stopColor="#7dd3fc" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.0" />
          </linearGradient>
          {/* wave 5 – subtle accent */}
          <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.0" />
            <stop offset="50%"  stopColor="#0284c7" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* ── wide pale layer behind everything ── */}
        <path
          fill="url(#g4)"
          d="M-100,300 C100,180 300,480 500,320 C700,160 900,420 1300,280 L1300,520 C900,650 700,390 500,550 C300,710 100,410 -100,530 Z"
          opacity="0.7"
        />

        {/* ── wave 1 – main thick pale blue ── */}
        <path
          fill="url(#g1)"
          d="M-100,320 C50,220 200,440 400,340 C600,240 750,400 950,290 C1100,210 1200,320 1300,300 L1300,410 C1200,430 1100,330 950,400 C750,510 600,360 400,450 C200,540 50,340 -100,430 Z"
          opacity="0.85"
        />

        {/* ── wave 2 – dark core ribbon ── */}
        <path
          fill="url(#g2)"
          d="M-100,360 C100,280 250,430 450,360 C650,290 800,380 1000,320 C1100,290 1200,340 1300,330 L1300,370 C1200,380 1100,330 1000,360 C800,420 650,330 450,400 C250,470 100,320 -100,400 Z"
          opacity="0.8"
        />

        {/* ── wave 3 – thin bright ribbon ── */}
        <path
          fill="url(#g3)"
          d="M-100,390 C80,340 220,420 430,375 C640,330 790,395 1000,350 C1120,325 1220,360 1300,355 L1300,380 C1220,385 1120,350 1000,375 C790,420 640,355 430,400 C220,445 80,365 -100,415 Z"
          opacity="0.9"
        />

        {/* ── wave 5 – accent edge line ── */}
        <path
          fill="url(#g5)"
          d="M-100,420 C100,385 280,440 480,405 C680,370 820,415 1020,385 C1140,368 1230,390 1300,388 L1300,398 C1230,400 1140,378 1020,395 C820,425 680,380 480,415 C280,450 100,395 -100,430 Z"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
