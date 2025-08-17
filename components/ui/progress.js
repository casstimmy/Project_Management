// components/ui/progress.js
import React from "react";

export function Progress({ value, max = 100 }) {
  const percentage = Math.min(Math.max(value, 0), max);

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
      <div
        className="h-4 bg-blue-500 transition-all duration-300 ease-in-out"
        style={{ width: `${(percentage / max) * 100}%` }}
      />
    </div>
  );
}
