import { useState, useEffect } from "react";

export default function Loader({ size = "default", text = "", fullScreen = false, showProgress = true }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;
    // Simulate real loading progress - fast at first, slows down near 90%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev + 0.2;
        if (prev >= 70) return prev + 0.5;
        if (prev >= 50) return prev + 1;
        return prev + 3;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [showProgress]);

  const clampedProgress = Math.min(Math.round(progress), 95);

  const sizeMap = {
    small: { spinner: "w-5 h-5", border: "border-2", text: "text-xs" },
    default: { spinner: "w-10 h-10", border: "border-[3px]", text: "text-sm" },
    large: { spinner: "w-14 h-14", border: "border-4", text: "text-base" },
  };
  const s = sizeMap[size] || sizeMap.default;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${s.spinner} ${s.border} border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && <p className={`${s.text} text-gray-500 font-medium`}>{text}</p>}
      {showProgress && (
        <div className="w-48 space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center">{clampedProgress}%</p>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {spinner}
    </div>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Banner skeleton */}
      <SkeletonBlock className="h-24 rounded-2xl mb-6" />

      {/* KPI cards row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-7 w-24" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
        ))}
      </div>

      {/* KPI cards row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SkeletonBlock className="h-4 w-40 mb-4" />
          <SkeletonBlock className="h-[250px]" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SkeletonBlock className="h-4 w-40 mb-4" />
          <SkeletonBlock className="h-[250px]" />
        </div>
      </div>

      {/* Quick access skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <SkeletonBlock className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100">
              <SkeletonBlock className="w-10 h-10 rounded-lg" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-[loading_2s_ease-in-out_infinite]"
              style={{ width: "60%", animation: "loading 2s ease-in-out infinite" }} />
          </div>
          <p className="text-xs text-gray-400">Loading dashboard...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
}