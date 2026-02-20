export default function Loader({ size = "default", text = "", fullScreen = false }) {
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
      {text && <p className={`${s.text} text-gray-500 font-medium animate-pulse`}>{text}</p>}
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