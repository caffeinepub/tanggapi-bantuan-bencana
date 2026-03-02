import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronRight,
  Home as HomeIcon,
  MapPin,
  MessageSquare,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetAllReports,
  useGetRecipientsByAidType,
  useGetRecipientsByDistrict,
  useGetRecipientsByStatus,
  useGetTotalRecipients,
} from "../hooks/useQueries";
import { formatNumber, getAidTypeLabel, getStatusLabel } from "../utils/format";

const STATUS_COLORS: Record<string, string> = {
  menunggu: "#d97706",
  diproses: "#2563eb",
  didistribusikan: "#059669",
};

const AID_TYPE_COLORS = ["#1e6aa6", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6"];

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  delay,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl p-6 shadow-card border border-border/50 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">
            {label}
          </p>
          <p className="text-3xl font-display font-bold text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function BerandaPage() {
  const { data: totalRecipients, isLoading: loadingTotal } =
    useGetTotalRecipients();
  const { data: byDistrict, isLoading: loadingDistrict } =
    useGetRecipientsByDistrict();
  const { data: byAidType, isLoading: loadingAidType } =
    useGetRecipientsByAidType();
  const { data: byStatus, isLoading: loadingStatus } =
    useGetRecipientsByStatus();
  const { data: allReports } = useGetAllReports();

  const districtData = (byDistrict ?? [])
    .map(([name, count]) => ({
      name: name.length > 16 ? `${name.slice(0, 14)}...` : name,
      penerima: Number(count),
    }))
    .sort((a, b) => b.penerima - a.penerima)
    .slice(0, 8);

  const aidTypeData = (byAidType ?? []).map(([name, count], i) => ({
    name: getAidTypeLabel(name),
    value: Number(count),
    color: AID_TYPE_COLORS[i % AID_TYPE_COLORS.length],
  }));

  const statusData = (byStatus ?? []).map(([name, count]) => ({
    name: getStatusLabel(name),
    value: Number(count),
    color: STATUS_COLORS[name] ?? "#94a3b8",
  }));

  const totalReportsCount = allReports?.length ?? 0;
  const uniqueDistricts = byDistrict?.length ?? 0;

  return (
    <div className="section-pattern">
      {/* Hero Section */}
      <section className="relative bg-navy overflow-hidden">
        <div className="hero-pattern absolute inset-0 pointer-events-none" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-gold" />
              Relawan TIK Indonesia
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              SISTEM INFORMASI
              <span className="block text-gold">RTIK INDONESIA PEDULI</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-2xl">
              Platform transparan untuk memantau dan mengelola data penerima
              bantuan bencana oleh Relawan TIK Indonesia. Data real-time,
              akurat, dan dapat dipertanggungjawabkan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/peta"
                className="inline-flex items-center gap-2 bg-gold text-white font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors shadow-lg"
              >
                <MapPin className="w-4 h-4" />
                Lihat Sebaran
              </Link>
              <Link
                to="/tanggapi"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Buat Laporan
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg
            viewBox="0 0 1440 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12"
            preserveAspectRatio="none"
            aria-hidden="true"
            role="img"
            aria-label="wave divider"
          >
            <path
              d="M0 48H1440V24C1200 0 960 48 720 24C480 0 240 48 0 24V48Z"
              fill="oklch(0.97 0.008 220)"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {loadingTotal ? (
            ["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                icon={Users}
                label="Total Penerima Bantuan"
                value={formatNumber(totalRecipients ?? BigInt(0))}
                subtitle="Terdaftar dalam sistem"
                color="#1e6aa6"
                delay={0.1}
              />
              <StatCard
                icon={MapPin}
                label="Kabupaten Terdampak"
                value={uniqueDistricts}
                subtitle="Wilayah terdaftar"
                color="#0ea5e9"
                delay={0.2}
              />
              <StatCard
                icon={MessageSquare}
                label="Total Pengaduan"
                value={totalReportsCount}
                subtitle="Laporan masuk"
                color="#8b5cf6"
                delay={0.3}
              />
              <StatCard
                icon={TrendingUp}
                label="Sudah Didistribusikan"
                value={
                  statusData.find((s) => s.name === "Didistribusikan")?.value ??
                  0
                }
                subtitle="Dari total penerima"
                color="#059669"
                delay={0.4}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* District Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  Penerima per Kabupaten
                </h3>
                <p className="text-muted-foreground text-sm">
                  Top 8 kabupaten terdampak
                </p>
              </div>
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            {loadingDistrict ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={districtData}
                  margin={{ top: 0, right: 0, left: -10, bottom: 40 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="penerima"
                    fill="oklch(0.32 0.085 228)"
                    radius={[4, 4, 0, 0]}
                    name="Penerima"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Aid Type Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-xl shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  Penerima per Jenis Bantuan
                </h3>
                <p className="text-muted-foreground text-sm">
                  Distribusi jenis bantuan
                </p>
              </div>
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            {loadingAidType ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={aidTypeData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {aidTypeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: "12px", color: "#374151" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-xl shadow-card border border-border/50 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Status Distribusi Bantuan
              </h3>
              <p className="text-muted-foreground text-sm">
                Proporsi status penerima bantuan
              </p>
            </div>
            <HomeIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          {loadingStatus ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {statusData.map((item) => {
                const total = statusData.reduce((acc, s) => acc + s.value, 0);
                const pct =
                  total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.value)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/peta"
            className="group flex items-center justify-between bg-navy rounded-xl p-6 text-white hover:bg-navy-dark transition-colors shadow-navy"
          >
            <div>
              <h3 className="font-display font-bold text-xl mb-1">
                Peta Sebaran
              </h3>
            </div>
            <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
          </Link>
          <Link
            to="/tanggapi"
            className="group flex items-center justify-between bg-white rounded-xl p-6 border border-border/50 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div>
              <h3 className="font-display font-bold text-xl mb-1 text-foreground">
                Pengaduan Warga
              </h3>
              <p className="text-muted-foreground text-sm">
                Sampaikan laporan dan pengaduan Anda
              </p>
            </div>
            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <Link
            to="/penerima-bantuan"
            className="group flex items-center justify-between bg-amber-50 rounded-xl p-6 border border-amber-200/60 shadow-card hover:shadow-card-hover hover:bg-amber-100/70 transition-all"
          >
            <div>
              <h3 className="font-display font-bold text-xl mb-1 text-amber-900">
                Data Penerima Bantuan
              </h3>
              <p className="text-amber-700/80 text-sm">
                Data penerima bantuan pasca bencana
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors" />
              <ChevronRight className="w-6 h-6 text-amber-400 group-hover:text-amber-700 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
