import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  MapPin,
  Package,
  Search,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AidTypeBadge } from "../components/StatusBadge";
import {
  useGetAllAidRecipients,
  useGetRecipientsByDistrict,
} from "../hooks/useQueries";
import { formatNumber } from "../utils/format";

// Koordinat kabupaten/kota di Aceh
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Banda Aceh": [5.5483, 95.3238],
  "Aceh Besar": [5.4677, 95.5313],
  Sabang: [5.8866, 95.3186],
  Pidie: [5.1612, 96.1312],
  "Pidie Jaya": [5.2285, 96.2827],
  Bireuen: [5.2038, 96.7031],
  "Aceh Utara": [5.0724, 97.0916],
  Lhokseumawe: [5.1801, 97.1502],
  "Aceh Timur": [4.6433, 97.8141],
  Langsa: [4.4683, 97.9679],
  "Aceh Tamiang": [4.2861, 98.0842],
  "Aceh Tengah": [4.6167, 96.8667],
  "Bener Meriah": [4.7267, 96.9161],
  "Gayo Lues": [3.9467, 97.4631],
  "Aceh Tenggara": [3.5892, 97.7927],
  "Aceh Selatan": [3.3028, 97.4289],
  "Aceh Singkil": [2.2799, 97.7896],
  Subulussalam: [2.6428, 98.0],
  "Nagan Raya": [4.105, 96.3697],
  "Aceh Barat Daya": [3.7167, 96.8333],
  "Aceh Barat": [4.1553, 96.0498],
  Simeulue: [2.6167, 96.1],
  Abdya: [3.7167, 96.8333],
  Meulaboh: [4.1434, 96.1282],
};

type ViewMode = "map" | "grid" | "list";

interface DistrictSummary {
  district: string;
  total: number;
  byAidType: Record<string, number>;
  byStatus: Record<string, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any;

function loadLeaflet(): Promise<LeafletLib> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).L) {
      resolve((window as unknown as Record<string, unknown>).L as LeafletLib);
      return;
    }
    // Load CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as unknown as Record<string, unknown>).L as LeafletLib;
      // Fix default icon
      // biome-ignore lint/performance/noDelete: required for leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      resolve(L);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function InteractiveMap({
  districts,
  onSelect,
  selected,
}: {
  districts: DistrictSummary[];
  onSelect: (d: DistrictSummary | null) => void;
  selected: DistrictSummary | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletLoaded(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapRef.current) return;
    const L = (window as unknown as Record<string, unknown>).L as LeafletLib;

    const map = L.map(containerRef.current, {
      center: [4.5, 96.5],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !leafletLoaded) return;
    const L = (window as unknown as Record<string, unknown>).L as LeafletLib;

    // Remove old markers
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const maxTotal = Math.max(...districts.map((d) => d.total), 1);

    for (const d of districts) {
      const coords = DISTRICT_COORDS[d.district];
      if (!coords) continue;

      const radius = 8 + (d.total / maxTotal) * 24;
      const isSelected = selected?.district === d.district;

      const marker = L.circleMarker(coords, {
        radius,
        fillColor: isSelected ? "#f59e0b" : "#1e3a5f",
        color: isSelected ? "#d97706" : "#3b82f6",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e3a5f">${d.district}</div>
          <div style="font-size:13px;color:#444">Penerima Bantuan: <b>${formatNumber(d.total)}</b></div>
          <div style="margin-top:6px;font-size:12px;color:#666">
            ${d.byStatus.menunggu ? `<span style="color:#d97706">${d.byStatus.menunggu} menunggu</span> ` : ""}
            ${d.byStatus.diproses ? `<span style="color:#2563eb">${d.byStatus.diproses} diproses</span> ` : ""}
            ${d.byStatus.didistribusikan ? `<span style="color:#059669">${d.byStatus.didistribusikan} selesai</span>` : ""}
          </div>
        </div>`,
      );

      marker.on("click", () => onSelect(d));
      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [districts, selected, onSelect, leafletLoaded]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export default function PetaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictSummary | null>(null);
  const { data: recipients, isLoading } = useGetAllAidRecipients();
  const { data: byDistrict } = useGetRecipientsByDistrict();

  const districtSummaries = useMemo<DistrictSummary[]>(() => {
    if (!recipients) return [];
    const distMap: Record<string, DistrictSummary> = {};
    for (const r of recipients) {
      if (!distMap[r.district]) {
        distMap[r.district] = {
          district: r.district,
          total: 0,
          byAidType: {},
          byStatus: {},
        };
      }
      const s = distMap[r.district];
      s.total++;
      s.byAidType[r.aidType] = (s.byAidType[r.aidType] ?? 0) + 1;
      s.byStatus[r.distributionStatus] =
        (s.byStatus[r.distributionStatus] ?? 0) + 1;
    }
    return Object.values(distMap).sort((a, b) => b.total - a.total);
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
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "map"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Peta
            </button>
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

        {/* Map View */}
        {viewMode === "map" && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Map Container */}
            <div
              className="flex-1 bg-white rounded-xl shadow-card border border-border/50 overflow-hidden"
              style={{ height: 520 }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <InteractiveMap
                  districts={filtered}
                  onSelect={setSelectedDistrict}
                  selected={selectedDistrict}
                />
              )}
            </div>

            {/* Side panel */}
            <div className="lg:w-72 space-y-3">
              {selectedDistrict ? (
                <motion.div
                  key={selectedDistrict.district}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-card border border-border/50 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                      {selectedDistrict.district}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedDistrict(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="bg-primary/10 rounded-lg px-4 py-3 text-center mb-4">
                    <p className="font-display font-bold text-3xl text-primary leading-none">
                      {formatNumber(selectedDistrict.total)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Penerima Bantuan
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Jenis Bantuan
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedDistrict.byAidType).map(
                        ([type]) => (
                          <AidTypeBadge key={type} status={type} />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status Distribusi
                    </p>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                      {Object.entries(selectedDistrict.byStatus).map(
                        ([status, count]) => {
                          const pct = (count / selectedDistrict.total) * 100;
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
                        },
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      {selectedDistrict.byStatus.menunggu !== undefined && (
                        <span className="text-xs text-amber-600">
                          {selectedDistrict.byStatus.menunggu} menunggu
                        </span>
                      )}
                      {selectedDistrict.byStatus.diproses !== undefined && (
                        <span className="text-xs text-blue-600">
                          {selectedDistrict.byStatus.diproses} diproses
                        </span>
                      )}
                      {selectedDistrict.byStatus.didistribusikan !==
                        undefined && (
                        <span className="text-xs text-emerald-600">
                          {selectedDistrict.byStatus.didistribusikan} sudah
                          didistribusikan
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-xl shadow-card border border-border/50 p-5">
                  <p className="text-sm text-muted-foreground text-center">
                    Klik marker pada peta untuk melihat detail kabupaten
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="bg-white rounded-xl shadow-card border-2 border-blue-200 p-4">
                <p className="text-sm font-bold text-foreground mb-3">
                  KETERANGAN
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                      style={{
                        backgroundColor: "#1e3a5f",
                        border: "2.5px solid #3b82f6",
                      }}
                    />
                    <span className="text-sm text-foreground">
                      Lokasi penerima bantuan
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                      style={{
                        backgroundColor: "#f59e0b",
                        border: "2.5px solid #d97706",
                      }}
                    />
                    <span className="text-sm text-foreground">
                      Lokasi dipilih
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1 pt-2.5 border-t border-blue-100 font-medium">
                    Ukuran lingkaran menunjukkan jumlah penerima
                  </div>
                </div>
              </div>

              {/* Top districts */}
              <div className="bg-white rounded-xl shadow-card border border-border/50 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Top 5 Terbanyak
                </p>
                <div className="space-y-2">
                  {districtSummaries.slice(0, 5).map((d, i) => (
                    <button
                      key={d.district}
                      type="button"
                      onClick={() => setSelectedDistrict(d)}
                      className="w-full flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-2 py-1.5 transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">
                        {d.district}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {formatNumber(d.total)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div>
            {isLoading ? (
              <div className="space-y-2">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-card border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Kabupaten/Kota
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-semibold">
                        Total Penerima
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">
                        Jenis Bantuan
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, i) => (
                      <motion.tr
                        key={d.district}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-secondary/30 transition-colors border-t border-border/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="font-medium">{d.district}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-display font-semibold">
                          {formatNumber(d.total)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(d.byAidType).map(([type]) => (
                              <AidTypeBadge key={type} status={type} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
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
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada data ditemukan</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && !isLoading && viewMode !== "map" && (
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
