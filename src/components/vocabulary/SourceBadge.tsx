type Source = "YLE" | "SM1" | "SM2";

const STYLES: Record<Source, string> = {
  YLE: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  SM1: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  SM2: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export function SourceBadge({ source }: { source?: string }) {
  const s = (source as Source) ?? "YLE";
  const style = STYLES[s] ?? STYLES.YLE;
  return (
    <span
      className={`absolute top-3 right-3 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${style}`}
    >
      {s}
    </span>
  );
}
