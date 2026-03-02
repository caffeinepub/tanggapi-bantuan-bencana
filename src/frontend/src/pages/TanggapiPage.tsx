import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Loader2,
  MessageSquare,
  Plus,
  SortAsc,
  SortDesc,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Report } from "../backend.d";
import { ReportStatusBadge, TopicBadge } from "../components/StatusBadge";
import { useAddReport, useGetAllReports } from "../hooks/useQueries";
import { formatDateId, newBigIntId, truncateText } from "../utils/format";

const TOPICS = [
  { value: "semua", label: "Semua", color: "bg-gray-100 text-gray-600" },
  { value: "bencana", label: "Bencana", color: "bg-red-100 text-red-700" },
  { value: "bantuan", label: "Bantuan", color: "bg-blue-100 text-blue-700" },
  {
    value: "pengungsian",
    label: "Pengungsian",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "infrastruktur",
    label: "Infrastruktur",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    value: "kesehatan",
    label: "Kesehatan",
    color: "bg-green-100 text-green-700",
  },
  { value: "lainnya", label: "Lainnya", color: "bg-gray-100 text-gray-600" },
];

interface ReportFormData {
  title: string;
  reporterName: string;
  topic: string;
  description: string;
}

const EMPTY_FORM: ReportFormData = {
  title: "",
  reporterName: "",
  topic: "",
  description: "",
};

export default function TanggapiPage() {
  const [activeTopic, setActiveTopic] = useState("semua");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<ReportFormData>(EMPTY_FORM);

  const { data: reports, isLoading } = useGetAllReports();
  const addReport = useAddReport();

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reports ?? []) {
      counts[r.topic] = (counts[r.topic] ?? 0) + 1;
    }
    return counts;
  }, [reports]);

  const filtered = useMemo(() => {
    let list = reports ?? [];
    if (activeTopic !== "semua") {
      list = list.filter((r) => r.topic === activeTopic);
    }
    return [...list].sort((a, b) => {
      const diff = Number(a.reportDate) - Number(b.reportDate);
      return sortOrder === "newest" ? -diff : diff;
    });
  }, [reports, activeTopic, sortOrder]);

  const openForm = () => {
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.title.trim() ||
      !form.reporterName.trim() ||
      !form.topic ||
      !form.description.trim()
    ) {
      toast.error("Semua field wajib diisi");
      return;
    }

    const newReport: Report = {
      id: newBigIntId(),
      title: form.title,
      reporterName: form.reporterName,
      topic: form.topic,
      description: form.description,
      status: "baru",
      reportDate: BigInt(Date.now()),
    };

    try {
      await addReport.mutateAsync(newReport);
      toast.success("Laporan berhasil dikirim");
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
    } catch {
      toast.error("Gagal mengirim laporan");
    }
  };

  return (
    <div className="section-pattern min-h-screen">
      {/* Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  Pengaduan &amp; Laporan Warga
                </h1>
                <p className="text-white/70">
                  {filtered.length} dari {reports?.length ?? 0} Aduan
                </p>
              </div>
            </div>
            <Button
              onClick={openForm}
              className="flex-shrink-0 bg-gold hover:bg-gold/90 text-white gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Buat Laporan</span>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card border border-border/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Topic filters */}
            <div className="flex-1 flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const count =
                  t.value === "semua"
                    ? (reports?.length ?? 0)
                    : (topicCounts[t.value] ?? 0);
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setActiveTopic(t.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeTopic === t.value
                        ? `${t.color} ring-2 ring-offset-1 ring-current`
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                        activeTopic === t.value ? "bg-black/10" : "bg-black/5"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 self-start">
              <button
                type="button"
                onClick={() => setSortOrder("newest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  sortOrder === "newest"
                    ? "bg-white shadow-xs text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <SortDesc className="w-3.5 h-3.5" />
                Terbaru
              </button>
              <button
                type="button"
                onClick={() => setSortOrder("oldest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  sortOrder === "oldest"
                    ? "bg-white shadow-xs text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <SortAsc className="w-3.5 h-3.5" />
                Terlama
              </button>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="space-y-4">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((report, i) => (
                <motion.div
                  key={String(report.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="bg-white rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-shadow p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                          {report.title}
                        </h3>
                        <ReportStatusBadge
                          status={report.status}
                          className="flex-shrink-0"
                        />
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {truncateText(report.description, 180)}
                      </p>
                      <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground">
                        <TopicBadge status={report.topic} />
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {report.reporterName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateId(report.reportDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">Belum ada laporan</p>
                <p className="text-sm mb-4">
                  Jadilah yang pertama menyampaikan laporan
                </p>
                <Button
                  onClick={openForm}
                  className="bg-primary text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Buat Laporan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Buat Laporan Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Judul Laporan *</Label>
              <Input
                id="title"
                placeholder="Masukkan judul laporan"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="reporterName">Nama Pelapor *</Label>
              <Input
                id="reporterName"
                placeholder="Nama lengkap Anda"
                value={form.reporterName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reporterName: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="topic">Topik *</Label>
              <Select
                value={form.topic}
                onValueChange={(v) => setForm((f) => ({ ...f, topic: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pilih topik laporan" />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.filter((t) => t.value !== "semua").map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                placeholder="Deskripsikan laporan Anda secara detail..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                className="mt-1.5 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setForm(EMPTY_FORM);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addReport.isPending}
              className="bg-primary text-white gap-2"
            >
              {addReport.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {addReport.isPending ? "Mengirim..." : "Kirim Laporan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
