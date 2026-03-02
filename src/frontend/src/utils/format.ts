export const BULAN_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatDateId(
  timestamp: bigint | number | undefined | null,
): string {
  if (timestamp === undefined || timestamp === null) return "-";
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getDate()} ${BULAN_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatNumber(n: bigint | number): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  return new Intl.NumberFormat("id-ID").format(num);
}

export function formatCurrency(n: bigint | number): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getAidTypeLabel(aidType: string): string {
  const labels: Record<string, string> = {
    logistik: "Logistik",
    "hunian-sementara": "Hunian Sementara",
    "hunian-tetap": "Hunian Tetap",
    kesehatan: "Kesehatan",
    pendidikan: "Pendidikan",
  };
  return labels[aidType] ?? aidType;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    menunggu: "Menunggu",
    diproses: "Diproses",
    didistribusikan: "Didistribusikan",
    baru: "Baru",
    ditindaklanjuti: "Ditindaklanjuti",
    selesai: "Selesai",
  };
  return labels[status] ?? status;
}

export function getTopicLabel(topic: string): string {
  const labels: Record<string, string> = {
    bencana: "Bencana",
    bantuan: "Bantuan",
    pengungsian: "Pengungsian",
    infrastruktur: "Infrastruktur",
    kesehatan: "Kesehatan",
    lainnya: "Lainnya",
  };
  return labels[topic] ?? topic;
}

export function newBigIntId(): bigint {
  return BigInt(Date.now());
}
