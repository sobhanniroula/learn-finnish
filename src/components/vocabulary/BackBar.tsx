import { ArrowLeft } from "lucide-react";

export function BackBar({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white active:text-white transition text-sm font-medium py-1 pr-2 -ml-1"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <span className="text-slate-600">/</span>
      <span className="text-white font-semibold">{title}</span>
    </div>
  );
}
