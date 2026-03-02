import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AidRecipient, Publication, Report } from "../backend.d";
import {
  AidTypeBadge,
  DistributionStatusBadge,
  ReportStatusBadge,
} from "../components/StatusBadge";
import {
  useAddAidRecipient,
  useAddPublication,
  useDeleteAidRecipient,
  useDeletePublication,
  useGetAllAidRecipients,
  useGetAllPublications,
  useGetAllReports,
  useInitializeSampleData,
  useIsCallerAdmin,
  useUpdateAidRecipient,
  useUpdatePublication,
  useUpdateReportStatus,
} from "../hooks/useQueries";
import {
  formatCurrency,
  formatDateId,
  getAidTypeLabel,
  newBigIntId,
} from "../utils/format";

// ─── Empty form defaults ──────────────────────────────────────────────────────

const EMPTY_RECIPIENT: Omit<AidRecipient, "id"> = {
  nik: "",
  name: "",
  district: "",
  subdistrict: "",
  address: "",
  aidType: "",
  aidAmount: BigInt(0),
  registrationDate: BigInt(Date.now()),
  distributionStatus: "menunggu",
};

const EMPTY_PUBLICATION: Omit<Publication, "id"> = {
  title: "",
  summary: "",
  content: "",
  author: "",
  publishDate: BigInt(Date.now()),
  readTime: BigInt(5),
  tags: [],
};

// ─── Aid Recipients Tab ───────────────────────────────────────────────────────

function AidRecipientsTab() {
  const [search, setSearch] = useState("");
  const [editingRecipient, setEditingRecipient] = useState<AidRecipient | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Omit<AidRecipient, "id">>(EMPTY_RECIPIENT);

  const { data: recipients, isLoading } = useGetAllAidRecipients();
  const addRecipient = useAddAidRecipient();
  const updateRecipient = useUpdateAidRecipient();
  const deleteRecipient = useDeleteAidRecipient();

  const filtered = useMemo(() => {
    if (!search.trim()) return recipients ?? [];
    const term = search.toLowerCase();
    return (recipients ?? []).filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.nik.includes(term) ||
        r.district.toLowerCase().includes(term),
    );
  }, [recipients, search]);

  const openAdd = () => {
    setEditingRecipient(null);
    setForm({ ...EMPTY_RECIPIENT, registrationDate: BigInt(Date.now()) });
    setIsFormOpen(true);
  };

  const openEdit = (r: AidRecipient) => {
    setEditingRecipient(r);
    setForm({
      nik: r.nik,
      name: r.name,
      district: r.district,
      subdistrict: r.subdistrict,
      address: r.address,
      aidType: r.aidType,
      aidAmount: r.aidAmount,
      registrationDate: r.registrationDate,
      distributionStatus: r.distributionStatus,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nik || !form.name || !form.district || !form.aidType) {
      toast.error("NIK, Nama, Kabupaten, dan Jenis Bantuan wajib diisi");
      return;
    }
    try {
      if (editingRecipient) {
        await updateRecipient.mutateAsync({ ...form, id: editingRecipient.id });
        toast.success("Data penerima diperbarui");
      } else {
        await addRecipient.mutateAsync({ ...form, id: newBigIntId() });
        toast.success("Penerima bantuan ditambahkan");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Operasi gagal");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRecipient.mutateAsync(deletingId);
      toast.success("Data penerima dihapus");
    } catch {
      toast.error("Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIK, kabupaten..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAdd} className="bg-primary text-white gap-2">
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nama / NIK</TableHead>
              <TableHead className="hidden md:table-cell">Kabupaten</TableHead>
              <TableHead className="hidden lg:table-cell">Kecamatan</TableHead>
              <TableHead className="hidden md:table-cell">
                Jenis Bantuan
              </TableHead>
              <TableHead className="hidden lg:table-cell text-right">
                Jumlah
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c", "d", "e"].map((rowKey) => (
                  <TableRow key={rowKey}>
                    {["1", "2", "3", "4", "5", "6", "7", "8"].map((colKey) => (
                      <TableCell key={colKey}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((r) => (
                  <TableRow
                    key={String(r.id)}
                    className="hover:bg-secondary/20"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.nik}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {r.district}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {r.subdistrict}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <AidTypeBadge status={r.aidType} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-right">
                      {formatCurrency(r.aidAmount)}
                    </TableCell>
                    <TableCell>
                      <DistributionStatusBadge status={r.distributionStatus} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDateId(r.registrationDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(r)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(r.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Tidak ada data penerima
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingRecipient
                ? "Edit Penerima Bantuan"
                : "Tambah Penerima Bantuan"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Nama lengkap"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>NIK *</Label>
              <Input
                value={form.nik}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nik: e.target.value }))
                }
                placeholder="16 digit NIK"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Kabupaten/Kota *</Label>
              <Input
                value={form.district}
                onChange={(e) =>
                  setForm((f) => ({ ...f, district: e.target.value }))
                }
                placeholder="Kabupaten/Kota"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Kecamatan</Label>
              <Input
                value={form.subdistrict}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subdistrict: e.target.value }))
                }
                placeholder="Kecamatan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Jenis Bantuan *</Label>
              <Select
                value={form.aidType}
                onValueChange={(v) => setForm((f) => ({ ...f, aidType: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logistik">Logistik</SelectItem>
                  <SelectItem value="hunian-sementara">
                    Hunian Sementara
                  </SelectItem>
                  <SelectItem value="hunian-tetap">Hunian Tetap</SelectItem>
                  <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="pendidikan">Pendidikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Alamat</Label>
              <Input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Alamat lengkap"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Jumlah Bantuan (Rp)</Label>
              <Input
                type="number"
                value={Number(form.aidAmount)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    aidAmount: BigInt(e.target.value || "0"),
                  }))
                }
                placeholder="0"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Status Distribusi</Label>
              <Select
                value={form.distributionStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, distributionStatus: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="didistribusikan">
                    Didistribusikan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecipient.isPending || updateRecipient.isPending}
              className="bg-primary text-white gap-2"
            >
              {(addRecipient.isPending || updateRecipient.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingRecipient ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Penerima?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data penerima bantuan akan
              dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecipient.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const { data: reports, isLoading } = useGetAllReports();
  const updateStatus = useUpdateReportStatus();

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status pengaduan diperbarui");
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead>Judul</TableHead>
            <TableHead className="hidden md:table-cell">Topik</TableHead>
            <TableHead className="hidden lg:table-cell">Pelapor</TableHead>
            <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ubah Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? ["a", "b", "c", "d"].map((rowKey) => (
                <TableRow key={rowKey}>
                  {["1", "2", "3", "4", "5", "6"].map((colKey) => (
                    <TableCell key={colKey}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : (reports ?? []).map((r) => (
                <TableRow key={String(r.id)} className="hover:bg-secondary/20">
                  <TableCell>
                    <p className="font-medium text-sm line-clamp-1">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">
                      {r.topic}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="capitalize text-sm">{r.topic}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {r.reporterName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDateId(r.reportDate)}
                  </TableCell>
                  <TableCell>
                    <ReportStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(v) => handleStatusChange(r.id, v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-36 ml-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">Baru</SelectItem>
                        <SelectItem value="ditindaklanjuti">
                          Ditindaklanjuti
                        </SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {(reports ?? []).length === 0 && !isLoading && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
          Tidak ada pengaduan
        </div>
      )}
    </div>
  );
}

// ─── Publications Tab ─────────────────────────────────────────────────────────

function PublicationsTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Omit<Publication, "id">>(EMPTY_PUBLICATION);
  const [tagsInput, setTagsInput] = useState("");

  const { data: publications, isLoading } = useGetAllPublications();
  const addPub = useAddPublication();
  const updatePub = useUpdatePublication();
  const deletePub = useDeletePublication();

  const openAdd = () => {
    setEditingPub(null);
    setForm({ ...EMPTY_PUBLICATION, publishDate: BigInt(Date.now()) });
    setTagsInput("");
    setIsFormOpen(true);
  };

  const openEdit = (p: Publication) => {
    setEditingPub(p);
    setForm({
      title: p.title,
      summary: p.summary,
      content: p.content,
      author: p.author,
      publishDate: p.publishDate,
      readTime: p.readTime,
      tags: p.tags,
    });
    setTagsInput(p.tags.join(", "));
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.summary || !form.author || !form.content) {
      toast.error("Judul, Ringkasan, Penulis, dan Konten wajib diisi");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const payload = { ...form, tags };
    try {
      if (editingPub) {
        await updatePub.mutateAsync({ ...payload, id: editingPub.id });
        toast.success("Publikasi diperbarui");
      } else {
        await addPub.mutateAsync({ ...payload, id: newBigIntId() });
        toast.success("Publikasi ditambahkan");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Operasi gagal");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deletePub.mutateAsync(deletingId);
      toast.success("Publikasi dihapus");
    } catch {
      toast.error("Gagal menghapus publikasi");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="bg-primary text-white gap-2">
          <Plus className="w-4 h-4" />
          Tambah Publikasi
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Penulis</TableHead>
              <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c"].map((rowKey) => (
                  <TableRow key={rowKey}>
                    {["1", "2", "3", "4", "5"].map((colKey) => (
                      <TableCell key={colKey}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (publications ?? []).map((p) => (
                  <TableRow
                    key={String(p.id)}
                    className="hover:bg-secondary/20"
                  >
                    <TableCell>
                      <p className="font-medium text-sm line-clamp-1">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {p.summary}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {p.author}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDateId(p.publishDate)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 bg-secondary text-xs rounded capitalize"
                          >
                            {t}
                          </span>
                        ))}
                        {p.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{p.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(p.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {(publications ?? []).length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Tidak ada publikasi
          </div>
        )}
      </div>

      {/* Publication Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingPub ? "Edit Publikasi" : "Tambah Publikasi"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Judul *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Judul publikasi"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Penulis *</Label>
                <Input
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  placeholder="Nama penulis"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Waktu Baca (menit)</Label>
                <Input
                  type="number"
                  value={Number(form.readTime)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      readTime: BigInt(e.target.value || "5"),
                    }))
                  }
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Tags (pisahkan dengan koma)</Label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="bencana, bantuan, laporan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Ringkasan *</Label>
              <Textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="Ringkasan singkat publikasi"
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>
            <div>
              <Label>Konten *</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Konten lengkap publikasi..."
                rows={6}
                className="mt-1.5 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addPub.isPending || updatePub.isPending}
              className="bg-primary text-white gap-2"
            >
              {(addPub.isPending || updatePub.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingPub ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Publikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsCallerAdmin();
  const initSampleData = useInitializeSampleData();

  const handleInitSampleData = async () => {
    try {
      await initSampleData.mutateAsync();
      toast.success("Data sampel berhasil diinisialisasi");
    } catch {
      toast.error("Gagal menginisialisasi data sampel");
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Memeriksa akses...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background section-pattern">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm p-8 bg-white rounded-2xl shadow-card-hover border border-border"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">
            Akses Terbatas
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Halaman ini hanya dapat diakses oleh administrator. Silakan masuk
            dengan akun admin terlebih dahulu.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-pattern min-h-screen">
      {/* Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-0.5">
                  Admin Panel
                </h1>
                <p className="text-white/60 text-sm">
                  Kelola data sistem informasi bantuan bencana
                </p>
              </div>
            </div>
            <Button
              onClick={handleInitSampleData}
              disabled={initSampleData.isPending}
              variant="outline"
              className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-2 flex-shrink-0"
            >
              {initSampleData.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Init Data Sampel</span>
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="recipients">
          <TabsList className="mb-6 bg-white border border-border shadow-xs">
            <TabsTrigger value="recipients" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Penerima Bantuan</span>
              <span className="sm:hidden">Penerima</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Pengaduan
            </TabsTrigger>
            <TabsTrigger value="publications" className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              Publikasi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipients">
            <AidRecipientsTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="publications">
            <PublicationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
