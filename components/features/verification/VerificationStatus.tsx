import { CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";

interface VerificationStatusProps {
  status: "unverified" | "pending" | "verified" | "rejected";
}

const config = {
  unverified: {
    icon: ShieldAlert,
    label: "Not Verified",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
  pending: {
    icon: Clock,
    label: "Pending Review",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

export default function VerificationStatus({ status }: VerificationStatusProps) {
  const { icon: Icon, label, color, bg } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${bg} ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
