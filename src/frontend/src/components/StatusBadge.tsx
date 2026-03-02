import { cn } from "@/lib/utils";
import { getStatusLabel } from "../utils/format";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function DistributionStatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  const styles: Record<string, string> = {
    menunggu: "bg-amber-50 text-amber-700 border border-amber-200",
    diproses: "bg-blue-50 text-blue-700 border border-blue-200",
    didistribusikan: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const style =
    styles[status] ?? "bg-gray-50 text-gray-600 border border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {getStatusLabel(status)}
    </span>
  );
}

export function ReportStatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    baru: "bg-sky-50 text-sky-700 border border-sky-200",
    ditindaklanjuti: "bg-violet-50 text-violet-700 border border-violet-200",
    selesai: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };

  const style =
    styles[status] ?? "bg-gray-50 text-gray-600 border border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {getStatusLabel(status)}
    </span>
  );
}

export function TopicBadge({ status: topic, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    bencana: "bg-red-50 text-red-700 border border-red-200",
    bantuan: "bg-blue-50 text-blue-700 border border-blue-200",
    pengungsian: "bg-purple-50 text-purple-700 border border-purple-200",
    infrastruktur: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    kesehatan: "bg-green-50 text-green-700 border border-green-200",
    lainnya: "bg-gray-50 text-gray-600 border border-gray-200",
  };

  const style =
    styles[topic] ?? "bg-gray-50 text-gray-600 border border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        style,
        className,
      )}
    >
      {topic.charAt(0).toUpperCase() + topic.slice(1)}
    </span>
  );
}

export function AidTypeBadge({ status: aidType, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    logistik: "bg-orange-50 text-orange-700 border border-orange-200",
    "hunian-sementara": "bg-yellow-50 text-yellow-700 border border-yellow-200",
    "hunian-tetap": "bg-teal-50 text-teal-700 border border-teal-200",
    kesehatan: "bg-green-50 text-green-700 border border-green-200",
    pendidikan: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };

  const style =
    styles[aidType] ?? "bg-gray-50 text-gray-600 border border-gray-200";
  const labels: Record<string, string> = {
    logistik: "Logistik",
    "hunian-sementara": "Hunian Sementara",
    "hunian-tetap": "Hunian Tetap",
    kesehatan: "Kesehatan",
    pendidikan: "Pendidikan",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
        className,
      )}
    >
      {labels[aidType] ?? aidType}
    </span>
  );
}
