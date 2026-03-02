import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  Printer,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BantuanPenerima } from "../backend.d";
import {
  useGetAllBantuanPenerima,
  useGetAllDisasterVictims,
} from "../hooks/useQueries";
import { formatDateId } from "../utils/format";

// ─── Kabupaten Parser ─────────────────────────────────────────────────────────

function parseKabupatenFromAlamat(alamat: string): string {
  if (!alamat) return "Tidak Diketahui";
  const match = alamat.match(/(?:Kab\.|Kabupaten\s+)([^,\n]+)/i);
  if (match) return match[1].trim();
  const parts = alamat
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "Tidak Diketahui";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ValidasiFilter = "semua" | "baru" | "diproses" | "ditindaklanjuti";

const STATUS_OPTIONS: { value: ValidasiFilter; label: string }[] = [
  { value: "semua", label: "Semua Status" },
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "ditindaklanjuti", label: "Ditindaklanjuti" },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "ditindaklanjuti") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 font-medium text-xs whitespace-nowrap print:bg-emerald-100">
        <CheckCircle2 className="w-3 h-3 print:hidden" />
        Ditindaklanjuti
      </Badge>
    );
  }
  if (status === "diproses") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1 font-medium text-xs whitespace-nowrap print:bg-amber-100">
        <Clock className="w-3 h-3 print:hidden" />
        Diproses
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-50 text-slate-600 border border-slate-200 gap-1 font-medium text-xs whitespace-nowrap print:bg-slate-100">
      <FileText className="w-3 h-3 print:hidden" />
      Baru
    </Badge>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  colorClass,
  bgClass,
  Icon,
  delay,
}: {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
  Icon: React.FC<{ className?: string }>;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${bgClass} rounded-xl p-4 border border-border/50 print:rounded-none print:border print:border-gray-300`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <Icon
          className={`w-5 h-5 ${colorClass} opacity-60 shrink-0 mt-0.5 print:hidden`}
        />
      </div>
    </motion.div>
  );
}

// ─── Print Styles ─────────────────────────────────────────────────────────────

const printStyles = `
@media print {
  /* Hide non-essential UI */
  .no-print { display: none !important; }
  
  /* Show print-only header */
  .print-only { display: block !important; }
  
  /* Page setup */
  @page { 
    margin: 1.2cm 1cm; 
    size: A4 landscape; 
  }

  /* Clean background */
  body { 
    background: white !important; 
    color: black !important;
    font-size: 10pt !important;
  }

  /* Hide navbar, footer, sidebar */
  header, footer, nav { display: none !important; }

  /* Table full width, compact */
  table { 
    font-size: 8pt !important; 
    width: 100% !important; 
    border-collapse: collapse !important;
  }

  th, td { 
    padding: 4px 6px !important; 
    border: 1px solid #ccc !important;
    vertical-align: top !important;
  }

  th { 
    background-color: #1e3a5f !important;
    color: white !important;
    font-weight: bold !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  tr:nth-child(even) td {
    background-color: #f5f8fc !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Page break control */
  .page-break-before { page-break-before: always !important; }
  tr { page-break-inside: avoid !important; }

  /* Summary cards in print */
  .print-summary { 
    display: flex !important; 
    gap: 8px !important; 
    margin-bottom: 12px !important; 
  }

  .print-summary-card {
    flex: 1 !important;
    border: 1px solid #ccc !important;
    padding: 6px 10px !important;
    border-radius: 4px !important;
  }

  /* Override motion styles */
  [data-motion-component] { transform: none !important; }
}
`;

// ─── Print Style Injector ─────────────────────────────────────────────────────

function PrintStyleInjector() {
  useEffect(() => {
    const styleId = "rekap-print-styles";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RekapPage() {
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>("semua");
  const [activeStatus, setActiveStatus] = useState<ValidasiFilter>("semua");
  const printRef = useRef<HTMLDivElement>(null);

  const { data: allBantuan, isLoading: loadingBantuan } =
    useGetAllBantuanPenerima();
  const { data: allVictims, isLoading: loadingVictims } =
    useGetAllDisasterVictims();

  const isLoading = loadingBantuan || loadingVictims;

  // Build unique kabupaten list from both sources
  const kabupatenList = useMemo(() => {
    const set = new Set<string>();

    // From DisasterVictim.kabupaten (explicit field)
    for (const v of allVictims ?? []) {
      if (v.kabupaten?.trim()) set.add(v.kabupaten.trim());
    }

    // From BantuanPenerima.alamat (parsed)
    for (const b of allBantuan ?? []) {
      const k = parseKabupatenFromAlamat(b.alamat);
      if (k && k !== "Tidak Diketahui") set.add(k);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b, "id"));
  }, [allBantuan, allVictims]);

  // Filter data
  const filteredData = useMemo(() => {
    let items: BantuanPenerima[] = allBantuan ?? [];

    if (selectedKabupaten !== "semua") {
      items = items.filter((b) => {
        const k = parseKabupatenFromAlamat(b.alamat);
        return k === selectedKabupaten;
      });
    }

    if (activeStatus !== "semua") {
      items = items.filter((b) => b.validasiStatus === activeStatus);
    }

    return items;
  }, [allBantuan, selectedKabupaten, activeStatus]);

  // Summary counts
  const summary = useMemo(() => {
    const total = filteredData.length;
    const baru = filteredData.filter((d) => d.validasiStatus === "baru").length;
    const diproses = filteredData.filter(
      (d) => d.validasiStatus === "diproses",
    ).length;
    const ditindak = filteredData.filter(
      (d) => d.validasiStatus === "ditindaklanjuti",
    ).length;
    return { total, baru, diproses, ditindak };
  }, [filteredData]);

  // Current date for print header
  const today = useMemo(() => {
    const d = new Date();
    const bulanId = [
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
    return `${d.getDate()} ${bulanId[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const kabupatenLabel =
    selectedKabupaten === "semua" ? "Semua Kabupaten/Kota" : selectedKabupaten;

  return (
    <>
      <PrintStyleInjector />

      <div className="section-pattern min-h-screen" ref={printRef}>
        {/* ── Print-Only Header ───────────────────────────────────── */}
        <div className="print-only hidden mb-6 border-b-2 border-navy pb-4">
          <div className="flex items-start gap-4">
            <img
              src="/assets/uploads/v-AbSTb_400x400-1--1.jpg"
              alt="Logo RTIK"
              className="w-16 h-16 object-contain"
            />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-navy uppercase tracking-wide">
                Relawan TIK Indonesia
              </h1>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Sistem Informasi RTIK Indonesia Peduli
              </p>
              <div className="mt-2 border-t border-gray-300 pt-2">
                <h2 className="text-base font-bold uppercase text-center text-navy tracking-wider">
                  Rekap Data Penerima Bantuan Pasca Bencana
                </h2>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>
                    <strong>Wilayah:</strong> {kabupatenLabel}
                  </span>
                  <span>
                    <strong>Status:</strong>{" "}
                    {activeStatus === "semua" ? "Semua Status" : activeStatus}
                  </span>
                  <span>
                    <strong>Tanggal Cetak:</strong> {today}
                  </span>
                  <span>
                    <strong>Total Data:</strong> {filteredData.length} orang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Header (screen only) ────────────────────────────── */}
        <div className="bg-navy no-print">
          <div className="container mx-auto px-4 py-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-0.5">
                      Rekap Data Penerima Bantuan
                    </h1>
                    <p className="text-white/60 text-sm">
                      Ringkasan dan laporan data penerima bantuan pasca bencana
                      &bull; Export ke PDF
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handlePrint}
                  className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-2 shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Ekspor PDF
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-8">
          {/* ── Filters (screen only) ────────────────────────────── */}
          <div className="no-print flex flex-col sm:flex-row gap-3 mb-6">
            {/* Kabupaten filter */}
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={selectedKabupaten}
                onValueChange={setSelectedKabupaten}
              >
                <SelectTrigger className="bg-white flex-1">
                  <SelectValue placeholder="Pilih Kabupaten..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kabupaten/Kota</SelectItem>
                  {kabupatenList.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex flex-wrap gap-1 bg-white border border-border rounded-xl p-1 shadow-xs">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActiveStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      activeStatus === opt.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-border gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              Ekspor PDF
            </Button>
          </div>

          {/* ── Filter Summary Label ─────────────────────────────── */}
          {!isLoading && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground no-print">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                Menampilkan data:{" "}
                <strong className="text-foreground">{kabupatenLabel}</strong>
              </span>
              {activeStatus !== "semua" && (
                <>
                  <span>·</span>
                  <span>
                    Status:{" "}
                    <strong className="text-foreground capitalize">
                      {activeStatus}
                    </strong>
                  </span>
                </>
              )}
              <span>·</span>
              <span>
                <strong className="text-foreground">
                  {filteredData.length}
                </strong>{" "}
                data ditemukan
              </span>
            </div>
          )}

          {/* ── Summary Cards ─────────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 print-summary">
              <SummaryCard
                label="Total Penerima"
                value={summary.total}
                colorClass="text-primary"
                bgClass="bg-primary/5"
                Icon={Users}
                delay={0}
              />
              <SummaryCard
                label="Baru"
                value={summary.baru}
                colorClass="text-slate-600"
                bgClass="bg-slate-50"
                Icon={FileText}
                delay={0.07}
              />
              <SummaryCard
                label="Diproses"
                value={summary.diproses}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
                Icon={Clock}
                delay={0.14}
              />
              <SummaryCard
                label="Ditindaklanjuti"
                value={summary.ditindak}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
                Icon={CheckCircle2}
                delay={0.21}
              />
            </div>
          )}

          {/* ── Print Summary (print only version) ────────────────── */}
          <div className="hidden print-only print-summary-cards mb-4">
            <div className="flex gap-4 text-xs">
              <div className="print-summary-card bg-blue-50 border border-blue-200 rounded px-3 py-2">
                <p className="font-bold text-blue-700">Total</p>
                <p className="text-lg font-extrabold text-blue-800">
                  {summary.total}
                </p>
              </div>
              <div className="print-summary-card bg-gray-50 border border-gray-200 rounded px-3 py-2">
                <p className="font-bold text-gray-600">Baru</p>
                <p className="text-lg font-extrabold text-gray-700">
                  {summary.baru}
                </p>
              </div>
              <div className="print-summary-card bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <p className="font-bold text-amber-700">Diproses</p>
                <p className="text-lg font-extrabold text-amber-800">
                  {summary.diproses}
                </p>
              </div>
              <div className="print-summary-card bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                <p className="font-bold text-emerald-700">Ditindaklanjuti</p>
                <p className="text-lg font-extrabold text-emerald-800">
                  {summary.ditindak}
                </p>
              </div>
            </div>
          </div>

          {/* ── Data Table ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-white rounded-xl border border-border overflow-hidden shadow-card"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  Rekap Data Penerima Bantuan
                </span>
                <Badge variant="secondary" className="text-xs font-medium ml-1">
                  {filteredData.length} data
                </Badge>
              </div>
              {selectedKabupaten !== "semua" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
                  <MapPin className="w-3 h-3" />
                  {selectedKabupaten}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-navy hover:bg-navy">
                    <TableHead className="text-white w-10 min-w-[40px] font-semibold whitespace-nowrap">
                      No.
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[140px] whitespace-nowrap">
                      Nama / NIK
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[180px] max-w-[200px] whitespace-nowrap">
                      Alamat
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[160px] max-w-[200px] whitespace-nowrap">
                      Keperluan Bantuan
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[120px] whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[130px] whitespace-nowrap">
                      Instansi Pembantu
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[160px] max-w-[200px] whitespace-nowrap">
                      Ket. Tindak Lanjut
                    </TableHead>
                    <TableHead className="text-white font-semibold min-w-[90px] whitespace-nowrap">
                      Tgl. Input
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? ["r1", "r2", "r3", "r4", "r5"].map((rk) => (
                        <TableRow key={rk}>
                          {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map(
                            (ck) => (
                              <TableCell key={ck}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ),
                          )}
                        </TableRow>
                      ))
                    : filteredData.map((item, index) => (
                        <TableRow
                          key={String(item.id)}
                          className={`hover:bg-secondary/20 transition-colors ${
                            index % 2 === 1 ? "bg-secondary/10" : ""
                          }`}
                        >
                          <TableCell className="text-sm text-muted-foreground font-medium text-center w-10 min-w-[40px]">
                            {index + 1}
                          </TableCell>
                          <TableCell className="min-w-[140px]">
                            <p className="font-semibold text-sm text-foreground whitespace-normal">
                              {item.nama}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5 whitespace-nowrap">
                              {item.nik}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[180px] max-w-[200px]">
                            <p className="text-sm text-muted-foreground whitespace-normal break-words line-clamp-2 leading-snug">
                              {item.alamat || "-"}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[160px] max-w-[200px]">
                            <p className="text-sm text-foreground whitespace-normal break-words line-clamp-2 leading-snug">
                              {item.keperluanBantuan || "-"}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <StatusBadge status={item.validasiStatus} />
                          </TableCell>
                          <TableCell className="min-w-[130px]">
                            {item.instansiPembantu ? (
                              <div className="flex items-start gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 print:hidden" />
                                <p className="text-sm text-foreground max-w-[130px] break-words whitespace-normal">
                                  {item.instansiPembantu}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[160px] max-w-[200px]">
                            <p className="text-sm text-muted-foreground whitespace-normal break-words line-clamp-2 leading-snug">
                              {item.tindakLanjutKeterangan ||
                                item.prosesTindakLanjut ||
                                "-"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap min-w-[90px]">
                            {formatDateId(item.createdDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>

            {/* Empty State */}
            {!isLoading && filteredData.length === 0 && (
              <div className="text-center py-14 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">Tidak ada data ditemukan</p>
                <p className="text-xs mt-1">
                  {selectedKabupaten !== "semua"
                    ? `Tidak ada data penerima bantuan di ${selectedKabupaten}`
                    : activeStatus !== "semua"
                      ? `Tidak ada data dengan status "${activeStatus}"`
                      : "Belum ada data penerima bantuan yang diinput"}
                </p>
              </div>
            )}
          </motion.div>

          {/* ── Footer Note (screen only) ──────────────────────────── */}
          <div className="no-print mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              Data diperbarui secara real-time dari sistem RTIK Indonesia Peduli
            </p>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Rekap ini sebagai PDF
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
