export function Spinner() {
  return (
    <div className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-yellow-400 rounded-full animate-spin" />
  );
}

import { useEffect } from "react";

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  const colorMap = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-sky-500"
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 text-white px-8 py-4 rounded-2xl font-semibold text-lg z-50 shadow-lg flex items-center gap-2 animate-fade-in ${colorMap[type]}`}>
      {message}
    </div>
  );
}
