import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutGrid, List, MapPin, Package, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { AidTypeBadge } from "../components/StatusBadge";
import {
  useGetAllAidRecipients,
  useGetRecipientsByDistrict,
} from "../hooks/useQueries";
import { formatNumber, getAidTypeLabel } from "../utils/format";

type ViewMode = "grid" | "list";

interface DistrictSummary {
  district: string;
  total: number;
  byAidType: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function PetaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: recipients, isLoading } = useGetAllAidRecipients();
  const { data: byDistrict } = useGetRecipientsByDistrict();

  const districtSummaries = useMemo<DistrictSummary[]>(() => {
    if (!recipients) return [];
    const map = new Map<string, DistrictSummary>();
    for (const r of recipients) {
      if (!map.has(r.district)) {
        map.set(r.district, {
          district: r.district,
          total: 0,
          byAidType: {},
          byStatus: {},
        });
      }
      const s = map.get(r.district)!;
      s.total++;
      s.byAidType[r.aidType] = (s.byAidType[r.aidType] ?? 0) + 1;
      s.byStatus[r.distributionStatus] =
        (s.byStatus[r.distributionStatus] ?? 0) + 1;
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [recipients]);

  const filtered = useMemo(
    () =>
      districtSummaries.filter((d) =>
        d.district.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [districtSummaries, searchTerm],
  );

  const totalAll = byDistrict?.reduce((acc, [, n]) => acc + Number(n), 0) ?? 0;

  return (
    <div className="section-pattern min-h-screen">
      {/* Page Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Sebaran Penerima Bantuan
              </h1>
              <p className="text-white/70">
                Data sebaran penerima bantuan bencana di seluruh kabupaten/kota
                Provinsi Aceh
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Total Penerima
              </span>
            </div>
            <p className="text-2xl font-display font-bold">
              {formatNumber(totalAll)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Kabupaten/Kota
              </span>
            </div>
            <p className="text-2xl font-display font-bold">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Jenis Bantuan
              </span>
            </div>
            <p className="text-2xl font-display font-bold">5</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kabupaten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
            }
          >
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <Skeleton key={k} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d, i) => (
              <motion.div
                key={d.district}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-white rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-shadow p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Kabupaten/Kota
                      </p>
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                      {d.district}
                    </h3>
                  </div>
                  <div className="bg-primary/10 rounded-xl px-3 py-2 text-center">
                    <p className="font-display font-bold text-xl text-primary leading-none">
                      {formatNumber(d.total)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      penerima
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Jenis Bantuan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(d.byAidType).map(([type]) => (
                      <AidTypeBadge key={type} status={type} />
                    ))}
                  </div>
                </div>

                {/* Status mini bars */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                    {Object.entries(d.byStatus).map(([status, count]) => {
                      const pct = (count / d.total) * 100;
                      const colors: Record<string, string> = {
                        menunggu: "#d97706",
                        diproses: "#2563eb",
                        didistribusikan: "#059669",
                      };
                      return (
                        <div
                          key={status}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: colors[status] ?? "#94a3b8",
                          }}
                          title={`${status}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-2">
                    {Object.entries(d.byStatus).map(([status, count]) => {
                      const colors: Record<string, string> = {
                        menunggu: "text-amber-600",
                        diproses: "text-blue-600",
                        didistribusikan: "text-emerald-600",
                      };
                      return (
                        <span
                          key={status}
                          className={`text-xs ${colors[status] ?? "text-gray-500"}`}
                        >
                          {count} {status}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="font-semibold">
                    Kabupaten/Kota
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    Total Penerima
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    Jenis Bantuan
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d, i) => (
                  <motion.tr
                    key={d.district}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="font-medium">{d.district}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-display font-semibold">
                      {formatNumber(d.total)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(d.byAidType).map(([type]) => (
                          <AidTypeBadge key={type} status={type} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-2">
                        {d.byStatus.menunggu && (
                          <span className="text-xs text-amber-600">
                            {d.byStatus.menunggu} menunggu
                          </span>
                        )}
                        {d.byStatus.diproses && (
                          <span className="text-xs text-blue-600">
                            {d.byStatus.diproses} diproses
                          </span>
                        )}
                        {d.byStatus.didistribusikan && (
                          <span className="text-xs text-emerald-600">
                            {d.byStatus.didistribusikan} selesai
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Tidak ada data ditemukan</p>
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">Tidak ada kabupaten ditemukan</p>
            <p className="text-sm">Coba kata kunci pencarian berbeda</p>
          </div>
        )}
      </div>
    </div>
  );
}
