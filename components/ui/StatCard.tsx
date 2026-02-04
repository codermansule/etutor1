type StatCardProps = {
  value: string;
  label: string;
  detail?: string;
};

export default function StatCard({ value, label, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_55px_rgba(2,6,23,0.75)]">
      <p className="text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      {detail && <p className="mt-2 text-sm text-slate-300">{detail}</p>}
    </div>
  );
}
