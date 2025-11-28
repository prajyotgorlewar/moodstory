import { MagnifyingGlassIcon } from "./MagnifyingGlassIcon";
import { MoodIcon } from "./MoodIcon";
import faceScan from "../../assets/faceScan.png";
import { useEffect, useState } from "react";

const scanningSteps = [
  {
    text: "Extracting facial features",
    duration: 4000,
    icon: (
      <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden">
        <img
          src={faceScan}
          alt="Face Scan"
          className="w-12 h-12 object-contain"
        />
        {/* Oscillating scan line overlay */}
        <div className="absolute inset-0">
          <div className="absolute left-0 w-full h-0.5 rounded-full bg-purple-500 shadow-[0_0_8px_#9C27B0] animate-oscillate-scan-line" />
        </div>
      </div>
    ),
  },
  {
    text: "Analyzing biometric data",
    duration: 4000,
    icon: <MagnifyingGlassIcon className="text-purple-500 w-12 h-12" />,
  },
  {
    text: "Detecting mood patterns",
    duration: 5000,
    icon: <MoodIcon className="text-purple-500 w-12 h-12" />,
  },
];

export const ScanningAnimation = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // 🔹 Pre-generate dots so the pattern doesn't change every render
  const [dots] = useState(() =>
    Array.from({ length: 80 }).map(() => {
      const size = Math.random() * 10 + 8; // 8px → 18px
      return {
        top: Math.random() * 100,
        left: Math.random() * 100,
        size,
        delay: Math.random() * 2,        // 0–2s
        duration: Math.random() * 2 + 3, // 3–5s
        tx: (Math.random() - 0.5) * 100, // -50px → 50px
        ty: (Math.random() - 0.5) * 100, // -50px → 50px
      };
    })
  );

  useEffect(() => {
    if (stepIndex >= scanningSteps.length) {
      onComplete && onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, scanningSteps[stepIndex].duration);

    return () => clearTimeout(timer);
  }, [stepIndex, onComplete]);

  const currentStep = scanningSteps[stepIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-end relative text-white bg-black/80 pb-20 pointer-events-none">
      {/* 🔹 Local styles for dot float + glowy pulse */}
      <style>{`
        @keyframes scanner-dot-float {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          50% {
            transform: translate3d(var(--tx, 0), var(--ty, 0), 0) scale(1.25);
            opacity: 1;
          }
          75% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
        }

        .scanner-dot {
          position: absolute;
          border-radius: 9999px;
          animation-name: scanner-dot-float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        /* 🔮 Pulsing glow around the card (no waves) */
        @keyframes glow-pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.45;
          }
          30% {
            transform: scale(1.02);
            opacity: 0.75;
          }
          60% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
        }

        .glow-wrapper {
          position: absolute;
          inset: -7px;           /* extend beyond card so it's not clipped */
          border-radius: 9999px;
          pointer-events: none;
          overflow: visible;
        }

        .glow-bg {
          width: 120%;
          height: 120%;
          position: absolute;
          top: -10%;
          left: -10%;
          border-radius: 9999px;
          filter: blur(26px);
          background: conic-gradient(
            from 180deg at 50% 50%,
            #4c1d95,
            #a855f7,
            #f472b6,
            #a855f7,
            #4c1d95
          );
          animation: glow-pulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* 🔹 Dots Layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="scanner-dot bg-white/60"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
              "--tx": `${dot.tx}px`,
              "--ty": `${dot.ty}px`,
            }}
          />
        ))}
      </div>

      {/* Text + Icon card with pulsing glow */}
      {currentStep && (
        <div className="relative z-10 w-[360px] max-w-[90vw]">
          {/* 🔮 Pulsing glow behind the card */}
          <div className="glow-wrapper">
            <div className="glow-bg" />
          </div>

          {/* Actual card */}
          <div
            key={stepIndex}
            className="relative flex items-center justify-center space-x-4
              bg-gradient-to-b from-[#050316] via-[#090019] to-[#14002b]
              p-4 rounded-2xl border border-purple-500/40
              shadow-[0_0_25px_10px_rgba(168,85,247,0.5)]"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              {currentStep.icon}
            </div>

            <p className="text-xl font-light tracking-wider w-64">
              {currentStep.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
