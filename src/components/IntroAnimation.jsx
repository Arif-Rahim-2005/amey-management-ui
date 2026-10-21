import { useEffect } from "react";

function ShipIllustration() {
  const boxes = [
    ["#2563EB", 40, 34],
    ["#DC2626", 72, 34],
    ["#1E3A8A", 104, 34],
    ["#DC2626", 136, 34],
    ["#2563EB", 168, 34],
    ["#1E3A8A", 56, 14],
    ["#2563EB", 88, 14],
    ["#DC2626", 120, 14],
    ["#1E3A8A", 152, 14],
  ];

  return (
    <svg
      viewBox="0 0 260 110"
      className="w-[min(70vw,460px)]"
      aria-hidden="true"
    >
      {boxes.map(([color, x, y], index) => (
        <rect
          key={index}
          x={x}
          y={y}
          width="30"
          height="19"
          rx="1.5"
          fill={color}
          opacity="0.95"
        />
      ))}

      <rect x="200" y="10" width="26" height="44" rx="2" fill="#F1F5F9" />
      <rect x="205" y="16" width="16" height="5" fill="#0F172A" opacity="0.6" />

      <path d="M10 55 H250 L232 92 H30 Z" fill="#0F172A" />
      <path d="M22 80 H238 L232 92 H30 Z" fill="#DC2626" />
    </svg>
  );
}

export function IntroAnimation({ onDone }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timer = window.setTimeout(onDone, reducedMotion ? 600 : 3600);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-slate-950"
      role="dialog"
      aria-label="Welcome to Amey Trading Company"
    >
      {/* Background glow */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950" />

      <div className="intro-title relative z-10 mb-10 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400">
          Clearing &amp; Forwarding
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Amey Trading Company
        </h1>

        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          Connecting cargo across East Africa
        </p>
      </div>

      {/* Ship */}
      <div className="relative z-10 w-full">
        <div className="intro-ship flex justify-center">
          <ShipIllustration />
        </div>

        {/* Animated water */}
        <div className="relative -mt-3 h-24 overflow-hidden text-blue-500">
          <svg
            className="intro-wave absolute h-full w-[200%]"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 30 Q75 10 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30 V100 H0Z"
              fill="currentColor"
              opacity="0.65"
            />
          </svg>

          <svg
            className="intro-wave intro-wave-delay absolute h-full w-[200%] text-cyan-400"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 42 Q75 22 150 42 T300 42 T450 42 T600 42 T750 42 T900 42 T1050 42 T1200 42 V100 H0Z"
              fill="currentColor"
              opacity="0.25"
            />
          </svg>
        </div>
      </div>

      <p className="relative z-10 mt-3 text-xs tracking-widest text-slate-400">
        MOVING YOUR WORLD FORWARD
      </p>

      <button
        type="button"
        onClick={onDone}
        className="absolute bottom-6 right-6 z-10 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        Skip intro →
      </button>

      <style>{`
        .intro-title {
          animation: introTitleIn 900ms ease-out both;
        }

        .intro-ship {
          animation: introSail 3.2s ease-in-out both;
        }

        .intro-ship svg {
          animation: introBob 2s ease-in-out infinite;
        }

        .intro-wave {
          animation: introWave 5s linear infinite;
        }

        .intro-wave-delay {
          animation-delay: -2.5s;
        }

        @keyframes introTitleIn {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes introSail {
          0% {
            opacity: 0;
            transform: translateX(-45vw);
          }
          15% {
            opacity: 1;
          }
          75% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes introBob {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes introWave {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .intro-title,
          .intro-ship,
          .intro-ship svg,
          .intro-wave {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
