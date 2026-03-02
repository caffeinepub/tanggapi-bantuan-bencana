import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Publication } from "../backend.d";
import { useGetAllPublications } from "../hooks/useQueries";
import { formatDateId, truncateText } from "../utils/format";

export default function PublikasiPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTag, setActiveTag] = useState<string>("semua");
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

  const { data: publications, isLoading } = useGetAllPublications();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const p of publications ?? []) {
      for (const tag of p.tags) tagSet.add(tag);
    }
    return Array.from(tagSet).sort();
  }, [publications]);

  const filtered = useMemo(() => {
    if (activeTag === "semua") return publications ?? [];
    return (publications ?? []).filter((p) => p.tags.includes(activeTag));
  }, [publications, activeTag]);

  return (
    <div className="section-pattern min-h-screen">
      {/* Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm mb-4">
              <BookOpen className="w-3.5 h-3.5 text-gold" />
              Laporan Interaktif
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
              PUBLIKASI
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Kajian kebutuhan dan analisis situasi terkini dalam laporan
              interaktif tentang penanggulangan bencana di Provinsi Aceh
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card border border-border/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Tag filters */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTag("semua")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTag === "semua"
                    ? "bg-primary text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua
              </button>
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                    activeTag === tag
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 self-start sm:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white shadow-xs text-foreground"
                    : "text-muted-foreground"
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
                    : "text-muted-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Publications */}
        {isLoading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <Skeleton key={k} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((pub, i) => (
                <motion.button
                  type="button"
                  key={String(pub.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setSelectedPub(pub)}
                  className="bg-white rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-all text-left group overflow-hidden"
                >
                  {/* Top color bar based on first tag */}
                  <div className="h-1.5 bg-gradient-to-r from-primary to-teal" />
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {pub.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {pub.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                      {pub.summary}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {pub.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateId(pub.publishDate)}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        {Number(pub.readTime)} mnt
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((pub, i) => (
                <motion.button
                  type="button"
                  key={String(pub.id)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  onClick={() => setSelectedPub(pub)}
                  className="w-full bg-white rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-all text-left group p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {pub.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-base leading-tight mb-1.5 group-hover:text-primary transition-colors">
                        {pub.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {pub.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {pub.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateId(pub.publishDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Number(pub.readTime)} mnt baca
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">Belum ada publikasi</p>
            <p className="text-sm">Publikasi akan ditampilkan di sini</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedPub} onOpenChange={() => setSelectedPub(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPub && (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedPub.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <DialogTitle className="font-display text-xl leading-tight text-left">
                  {selectedPub.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {selectedPub.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateId(selectedPub.publishDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Number(selectedPub.readTime)} menit baca
                  </span>
                </div>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-secondary/50 rounded-lg p-4 mb-4 border-l-4 border-primary">
                  <p className="text-sm font-medium text-foreground italic">
                    {selectedPub.summary}
                  </p>
                </div>
                <div className="prose prose-sm max-w-none text-foreground">
                  {selectedPub.content.split("\n").map((paragraph, i) => (
                    <p
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable static content
                      key={i}
                      className="mb-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
