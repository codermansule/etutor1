import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  tag?: string;
  accent?: string;
  icon?: ReactNode;
};

export default function FeatureCard({
  title,
  description,
  tag,
  accent = "from-slate-900 via-slate-900 to-slate-900",
  icon,
}: FeatureCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-6 shadow-[0_25px_50px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:bg-slate-900/40">
      <div className="flex items-center justify-between">
        {tag && (
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            {tag}
          </span>
        )}
        {icon && <div className="text-lg">{icon}</div>}
      </div>
      <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
      <div
        className={`mt-6 h-1 w-full rounded-full bg-gradient-to-r ${accent}`}
      />
    </article>
  );
}
