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
import { Badge } from "@/components/ui/badge";
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
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  HandHeart,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  LogIn,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  ShieldMinus,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  AidRecipient,
  FooterLink,
  Publication,
  Report,
} from "../backend.d";
import { UserRole } from "../backend.d";
import {
  AidTypeBadge,
  DistributionStatusBadge,
  ReportStatusBadge,
} from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddAidRecipient,
  useAddFooterLink,
  useAddPublication,
  useAddReport,
  useAssignUserRole,
  useAssignValidatorRole,
  useDeleteAidRecipient,
  useDeleteFooterLink,
  useDeletePublication,
  useGetAllAidRecipients,
  useGetAllBantuanPenerima,
  useGetAllPublications,
  useGetAllReports,
  useGetAllUsers,
  useGetAllValidators,
  useGetFooterLinks,
  useGetValidationStats,
  useInitializeSampleData,
  useRevokeValidatorRole,
  useUpdateAidRecipient,
  useUpdateFooterLink,
  useUpdatePublication,
  useUpdateReportStatus,
} from "../hooks/useQueries";
import { formatCurrency, formatDateId, newBigIntId } from "../utils/format";

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

const EMPTY_REPORT: Omit<Report, "id"> = {
  title: "",
  description: "",
  topic: "",
  reporterName: "",
  reportDate: BigInt(Date.now()),
  status: "baru",
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
  const [search, setSearch] = useState("");
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Omit<Report, "id">>(EMPTY_REPORT);
  const [editStatus, setEditStatus] = useState("baru");

  const { data: reports, isLoading } = useGetAllReports();
  const addReport = useAddReport();
  const updateStatus = useUpdateReportStatus();

  const filtered = useMemo(() => {
    const active = (reports ?? []).filter((r) => r.status !== "dihapus");
    if (!search.trim()) return active;
    const term = search.toLowerCase();
    return active.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.reporterName.toLowerCase().includes(term) ||
        r.topic.toLowerCase().includes(term),
    );
  }, [reports, search]);

  const openAdd = () => {
    setEditingReport(null);
    setForm({ ...EMPTY_REPORT, reportDate: BigInt(Date.now()) });
    setIsFormOpen(true);
  };

  const openEditStatus = (r: Report) => {
    setEditingReport(r);
    setEditStatus(r.status);
    setIsStatusDialogOpen(true);
  };

  const handleSubmitAdd = async () => {
    if (!form.title || !form.reporterName || !form.topic) {
      toast.error("Judul, Pelapor, dan Topik wajib diisi");
      return;
    }
    try {
      await addReport.mutateAsync({ ...form, id: newBigIntId() });
      toast.success("Pengaduan berhasil ditambahkan");
      setIsFormOpen(false);
    } catch {
      toast.error("Gagal menambahkan pengaduan");
    }
  };

  const handleSaveStatus = async () => {
    if (!editingReport) return;
    try {
      await updateStatus.mutateAsync({
        id: editingReport.id,
        status: editStatus,
      });
      toast.success("Status pengaduan diperbarui");
      setIsStatusDialogOpen(false);
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await updateStatus.mutateAsync({ id: deletingId, status: "dihapus" });
      toast.success("Pengaduan dihapus");
    } catch {
      toast.error("Gagal menghapus pengaduan");
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
            placeholder="Cari judul, pelapor, topik..."
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
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Topik</TableHead>
              <TableHead className="hidden lg:table-cell">Pelapor</TableHead>
              <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
              : filtered.map((r) => (
                  <TableRow
                    key={String(r.id)}
                    className="hover:bg-secondary/20"
                  >
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditStatus(r)}
                          title="Ubah Status"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(r.id)}
                          title="Hapus"
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
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Tidak ada pengaduan
          </div>
        )}
      </div>

      {/* Tambah Pengaduan Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Tambah Pengaduan Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Judul Pengaduan *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Judul pengaduan"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nama Pelapor *</Label>
                <Input
                  value={form.reporterName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reporterName: e.target.value }))
                  }
                  placeholder="Nama lengkap"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Topik *</Label>
                <Select
                  value={form.topic}
                  onValueChange={(v) => setForm((f) => ({ ...f, topic: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Pilih topik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bencana">Bencana</SelectItem>
                    <SelectItem value="bantuan">Bantuan</SelectItem>
                    <SelectItem value="pengungsian">Pengungsian</SelectItem>
                    <SelectItem value="infrastruktur">Infrastruktur</SelectItem>
                    <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Detail pengaduan..."
                rows={4}
                className="mt-1.5 resize-none"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="mt-1.5">
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
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitAdd}
              disabled={addReport.isPending}
              className="bg-primary text-white gap-2"
            >
              {addReport.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ubah Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">
              Ubah Status Pengaduan
            </DialogTitle>
          </DialogHeader>
          {editingReport && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {editingReport.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pelapor: {editingReport.reporterName}
                </p>
              </div>
              <div>
                <Label>Status Pengaduan</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1.5">
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
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveStatus}
              disabled={updateStatus.isPending}
              className="bg-primary text-white gap-2"
            >
              {updateStatus.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengaduan?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengaduan ini akan dihapus dari daftar. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateStatus.isPending ? (
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

// ─── Links Tab ────────────────────────────────────────────────────────────────

const EMPTY_FOOTER_LINK: Omit<FooterLink, "id"> = {
  linkLabel: "",
  url: "",
  order: BigInt(1),
};

function LinksTab() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [form, setForm] = useState<Omit<FooterLink, "id">>(EMPTY_FOOTER_LINK);

  const { data: footerLinks, isLoading } = useGetFooterLinks();
  const addLink = useAddFooterLink();
  const updateLink = useUpdateFooterLink();
  const deleteLink = useDeleteFooterLink();

  const sorted = [...(footerLinks ?? [])].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const openAdd = () => {
    setEditingLink(null);
    setForm(EMPTY_FOOTER_LINK);
    setIsFormOpen(true);
  };

  const openEdit = (link: FooterLink) => {
    setEditingLink(link);
    setForm({
      linkLabel: link.linkLabel,
      url: link.url,
      order: link.order,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.linkLabel || !form.url) {
      toast.error("Label dan URL wajib diisi");
      return;
    }
    try {
      if (editingLink) {
        await updateLink.mutateAsync({ ...form, id: editingLink.id });
        toast.success("Link diperbarui");
      } else {
        await addLink.mutateAsync({ ...form, id: newBigIntId() });
        toast.success("Link ditambahkan");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Operasi gagal");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteLink.mutateAsync(deletingId);
      toast.success("Link dihapus");
    } catch {
      toast.error("Gagal menghapus link");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} className="bg-primary text-white gap-2">
          <Plus className="w-4 h-4" />
          Tambah Link
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>No. Urut</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="hidden md:table-cell">URL</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c"].map((rowKey) => (
                  <TableRow key={rowKey}>
                    {["1", "2", "3", "4"].map((colKey) => (
                      <TableCell key={colKey}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : sorted.map((link) => (
                  <TableRow
                    key={String(link.id)}
                    className="hover:bg-secondary/20"
                  >
                    <TableCell className="text-sm font-medium">
                      {Number(link.order)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{link.linkLabel}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate max-w-xs block"
                      >
                        {link.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(link)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingId(link.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {sorted.length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Belum ada link footer
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingLink ? "Edit Link Footer" : "Tambah Link Footer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Label *</Label>
              <Input
                value={form.linkLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linkLabel: e.target.value }))
                }
                placeholder="Nama tampilan link"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>URL *</Label>
              <Input
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Urutan</Label>
              <Input
                type="number"
                min="1"
                value={Number(form.order)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order: BigInt(e.target.value || "1"),
                  }))
                }
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addLink.isPending || updateLink.isPending}
              className="bg-primary text-white gap-2"
            >
              {(addLink.isPending || updateLink.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingLink ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Link?</AlertDialogTitle>
            <AlertDialogDescription>
              Link ini akan dihapus dari footer. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLink.isPending ? (
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

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab() {
  const [confirmUser, setConfirmUser] = useState<{
    principal: string;
    currentRole: string;
    targetRole: UserRole;
  } | null>(null);

  const { data: users, isLoading, refetch, isFetching } = useGetAllUsers();
  const assignRole = useAssignUserRole();

  const handleConfirmRoleChange = async () => {
    if (!confirmUser) return;
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principalObj = Principal.fromText(confirmUser.principal);
      await assignRole.mutateAsync({
        user: principalObj,
        role: confirmUser.targetRole,
      });
      const roleLabel =
        confirmUser.targetRole === UserRole.admin
          ? "admin"
          : confirmUser.targetRole === UserRole.user
            ? "user"
            : "guest";
      toast.success(`Role pengguna berhasil diubah menjadi ${roleLabel}`);
    } catch {
      toast.error("Gagal mengubah role pengguna");
    } finally {
      setConfirmUser(null);
    }
  };

  const shortenPrincipal = (p: string) => {
    if (p.length <= 16) return p;
    return `${p.slice(0, 8)}...${p.slice(-4)}`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">
            Daftar Pengguna Terdaftar
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users ? `${users.length} pengguna terdaftar` : "Memuat data..."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-12">No.</TableHead>
              <TableHead>Principal ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c", "d"].map((rowKey) => (
                  <TableRow key={rowKey}>
                    {["1", "2", "3", "4"].map((colKey) => (
                      <TableCell key={colKey}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (users ?? []).map((u, index) => {
                  const principalStr = u.principal.toString();
                  return (
                    <TableRow
                      key={principalStr}
                      className="hover:bg-secondary/20"
                    >
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <code
                          className="text-xs bg-muted px-2 py-1 rounded font-mono"
                          title={principalStr}
                        >
                          {shortenPrincipal(principalStr)}
                        </code>
                      </TableCell>
                      <TableCell>
                        {u.role === "admin" ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 font-medium">
                            <Shield className="w-3.5 h-3.5" />
                            Admin
                          </Badge>
                        ) : u.role === "user" ? (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            User
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="gap-1.5 font-medium text-muted-foreground"
                          >
                            Guest
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Guest: can be promoted to User */}
                          {u.role === "guest" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8"
                              onClick={() =>
                                setConfirmUser({
                                  principal: principalStr,
                                  currentRole: u.role,
                                  targetRole: UserRole.user,
                                })
                              }
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Jadikan User
                            </Button>
                          )}
                          {/* User: promote to admin or reset to guest */}
                          {u.role === "user" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-primary text-white gap-1.5 h-8"
                                onClick={() =>
                                  setConfirmUser({
                                    principal: principalStr,
                                    currentRole: u.role,
                                    targetRole: UserRole.admin,
                                  })
                                }
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Jadikan Admin
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 h-8"
                                onClick={() =>
                                  setConfirmUser({
                                    principal: principalStr,
                                    currentRole: u.role,
                                    targetRole: UserRole.guest,
                                  })
                                }
                              >
                                <ShieldMinus className="w-3.5 h-3.5" />
                                Reset ke Guest
                              </Button>
                            </>
                          )}
                          {/* Admin: demote to user or reset to guest */}
                          {u.role === "admin" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-1.5 h-8"
                                onClick={() =>
                                  setConfirmUser({
                                    principal: principalStr,
                                    currentRole: u.role,
                                    targetRole: UserRole.user,
                                  })
                                }
                              >
                                <ShieldMinus className="w-3.5 h-3.5" />
                                Turunkan ke User
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 h-8"
                                onClick={() =>
                                  setConfirmUser({
                                    principal: principalStr,
                                    currentRole: u.role,
                                    targetRole: UserRole.guest,
                                  })
                                }
                              >
                                <ShieldMinus className="w-3.5 h-3.5" />
                                Reset ke Guest
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {(users ?? []).length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <UserCog className="w-8 h-8 mx-auto mb-2 opacity-20" />
            Belum ada pengguna terdaftar
          </div>
        )}
      </div>

      {/* Konfirmasi Ubah Role */}
      <AlertDialog
        open={!!confirmUser}
        onOpenChange={() => setConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah Role Pengguna?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>Apakah Anda yakin ingin mengubah role pengguna ini?</span>
              {confirmUser && (
                <span className="block mt-2 font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                  {confirmUser.principal}
                </span>
              )}
              {confirmUser && (
                <span className="block mt-1">
                  Role akan diubah dari{" "}
                  <strong className="capitalize">
                    {confirmUser.currentRole}
                  </strong>{" "}
                  menjadi{" "}
                  <strong className="capitalize">
                    {confirmUser.targetRole}
                  </strong>
                  .
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRoleChange}
              className={
                confirmUser?.targetRole === UserRole.admin
                  ? "bg-primary text-white hover:bg-primary/90"
                  : confirmUser?.targetRole === UserRole.guest
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-orange-500 text-white hover:bg-orange-600"
              }
            >
              {assignRole.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Ya, Ubah Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Validator Management Tab ─────────────────────────────────────────────────

function ValidatorManagementTab() {
  const [newPrincipal, setNewPrincipal] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState<Principal | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const {
    data: validators,
    isLoading: loadingValidators,
    refetch,
    isFetching,
  } = useGetAllValidators();
  const { data: stats, isLoading: loadingStats } = useGetValidationStats();
  const assignValidator = useAssignValidatorRole();
  const revokeValidator = useRevokeValidatorRole();

  const handleAssign = async () => {
    if (!newPrincipal.trim()) {
      toast.error("Principal ID wajib diisi");
      return;
    }
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      const principalObj = Principal.fromText(newPrincipal.trim());
      await assignValidator.mutateAsync(principalObj);
      toast.success("Validator berhasil ditambahkan");
      setNewPrincipal("");
      setIsAddOpen(false);
    } catch {
      toast.error("Gagal menambahkan validator. Pastikan Principal ID valid.");
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    try {
      await revokeValidator.mutateAsync(confirmRevoke);
      toast.success("Role validator berhasil dicabut");
    } catch {
      toast.error("Gagal mencabut role validator");
    } finally {
      setConfirmRevoke(null);
    }
  };

  const shortenPrincipal = (p: string) => {
    if (p.length <= 20) return p;
    return `${p.slice(0, 10)}...${p.slice(-6)}`;
  };

  const totalVictims = stats ? Number(stats.totalVictims) : 0;
  const byStatus = stats?.byValidationStatus ?? [];
  const byType = stats?.byDisasterType ?? [];

  const getStatusCount = (status: string) => {
    const found = byStatus.find(([s]) => s === status);
    return found ? Number(found[1]) : 0;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Total Korban
          </p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{totalVictims}</p>
          )}
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Menunggu Validasi
          </p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-gray-600">
              {getStatusCount("menunggu")}
            </p>
          )}
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Sudah Divalidasi
          </p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-emerald-600">
              {getStatusCount("divalidasi")}
            </p>
          )}
        </div>
        <div className="bg-white border border-border rounded-xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Ditolak
          </p>
          {loadingStats ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold text-destructive">
              {getStatusCount("ditolak")}
            </p>
          )}
        </div>
      </div>

      {/* Disaster Type Stats */}
      {byType.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-4 shadow-card mb-6">
          <h4 className="font-semibold text-sm mb-3">Sebaran Jenis Bencana</h4>
          <div className="flex flex-wrap gap-2">
            {byType.map(([type, count]) => (
              <span
                key={type}
                className="px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium capitalize"
              >
                {type}:{" "}
                <span className="font-bold text-primary">{Number(count)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validator List */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            Daftar Admin Validasi
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {validators
              ? `${validators.length} validator aktif`
              : "Memuat data..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Tambah Validator
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-12">No.</TableHead>
              <TableHead>Principal ID (Validator)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingValidators
              ? ["a", "b"].map((k) => (
                  <TableRow key={k}>
                    {["1", "2", "3", "4"].map((c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (validators ?? []).map((principal, idx) => {
                  const principalStr = principal.toString();
                  return (
                    <TableRow
                      key={principalStr}
                      className="hover:bg-secondary/20"
                    >
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <code
                          className="text-xs bg-muted px-2 py-1 rounded font-mono"
                          title={principalStr}
                        >
                          {shortenPrincipal(principalStr)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-medium">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Validator Aktif
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 h-8"
                            onClick={() => setConfirmRevoke(principal)}
                          >
                            <ShieldMinus className="w-3.5 h-3.5" />
                            Cabut Akses
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        {(validators ?? []).length === 0 && !loadingValidators && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Belum ada validator terdaftar</p>
            <p className="text-xs mt-1">
              Tambahkan validator untuk membantu proses validasi data bencana
            </p>
          </div>
        )}
      </div>

      {/* Add Validator Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              Tambah Admin Validasi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Principal ID *</Label>
              <Input
                value={newPrincipal}
                onChange={(e) => setNewPrincipal(e.target.value)}
                placeholder="Contoh: aaaaa-bbbbb-ccccc-..."
                className="mt-1.5 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Masukkan Principal ID pengguna yang akan dijadikan validator.
                Pengguna harus sudah login terlebih dahulu.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignValidator.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              {assignValidator.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Tambah Validator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog
        open={!!confirmRevoke}
        onOpenChange={() => setConfirmRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cabut Akses Validator?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>
                Apakah Anda yakin ingin mencabut akses validator dari pengguna
                ini?
              </span>
              {confirmRevoke && (
                <span className="block mt-2 font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                  {confirmRevoke.toString()}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeValidator.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Cabut Akses
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Bantuan Penerima Summary Tab ─────────────────────────────────────────────

function BantuanPenerimaSummaryTab() {
  const { data, isLoading } = useGetAllBantuanPenerima();

  const total = data?.length ?? 0;
  const baru = data?.filter((d) => d.validasiStatus === "baru").length ?? 0;
  const diproses =
    data?.filter((d) => d.validasiStatus === "diproses").length ?? 0;
  const ditindak =
    data?.filter((d) => d.validasiStatus === "ditindaklanjuti").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Penerima",
            value: total,
            color: "text-primary",
            bg: "bg-primary/5",
            icon: Users,
          },
          {
            label: "Baru",
            value: baru,
            color: "text-slate-600",
            bg: "bg-slate-50",
            icon: HandHeart,
          },
          {
            label: "Diproses",
            value: diproses,
            color: "text-amber-600",
            bg: "bg-amber-50",
            icon: Clock,
          },
          {
            label: "Ditindaklanjuti",
            value: ditindak,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            icon: CheckCircle2,
          },
        ].map((c) => (
          <div
            key={c.label}
            className={`${c.bg} rounded-xl p-4 border border-border/50`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {c.label}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                )}
              </div>
              <c.icon
                className={`w-5 h-5 ${c.color} opacity-60 shrink-0 mt-0.5`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Entries */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">
            Data Terbaru
          </h3>
          <Link
            to="/penerima-bantuan"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Kelola Semua Data
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nama / NIK</TableHead>
              <TableHead className="hidden md:table-cell">
                Keperluan Bantuan
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c"].map((k) => (
                  <TableRow key={k}>
                    {["1", "2", "3", "4"].map((c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (data ?? []).slice(0, 5).map((item) => (
                  <TableRow
                    key={String(item.id)}
                    className="hover:bg-secondary/20"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{item.nama}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.nik}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {item.keperluanBantuan || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.validasiStatus === "ditindaklanjuti" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          Ditindaklanjuti
                        </Badge>
                      ) : item.validasiStatus === "diproses" ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs">
                          <Clock className="w-3 h-3" />
                          Diproses
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-xs text-muted-foreground"
                        >
                          Baru
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDateId(item.createdDate)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {(data ?? []).length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <HandHeart className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Belum ada data penerima bantuan</p>
            <Link
              to="/penerima-bantuan"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              Tambahkan di halaman Penerima Bantuan
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Link to="/penerima-bantuan">
          <Button className="bg-primary text-white gap-2">
            <HandHeart className="w-4 h-4" />
            Buka Halaman Penerima Bantuan
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Login Prompt ─────────────────────────────────────────────────────────────

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background section-pattern p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-card-hover border border-border p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white shadow-md p-1 border border-border">
              <img
                src="/assets/uploads/v-AbSTb_400x400-1--1.jpg"
                alt="Relawan TIK Indonesia Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="font-display text-2xl font-bold">Panel Admin</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Login dengan Internet Identity untuk mengakses panel pengelolaan
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary text-white gap-2"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoggingIn
              ? "Menghubungkan..."
              : "Masuk dengan Internet Identity"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Admin Panel Content ──────────────────────────────────────────────────────

function AdminPanelContent() {
  const { clear } = useInternetIdentity();
  const initSampleData = useInitializeSampleData();

  const handleInitSampleData = async () => {
    try {
      await initSampleData.mutateAsync();
      toast.success("Data sampel berhasil diinisialisasi");
    } catch {
      toast.error("Gagal menginisialisasi data sampel");
    }
  };

  return (
    <div className="section-pattern min-h-screen">
      {/* Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-0.5">
                  Panel Admin
                </h1>
                <p className="text-white/60 text-sm">
                  Kelola data sistem informasi bantuan bencana
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleInitSampleData}
                disabled={initSampleData.isPending}
                variant="outline"
                className="border-white/20 text-white bg-white/10 hover:bg-white/20 gap-2"
              >
                {initSampleData.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Init Data Sampel</span>
              </Button>
              <Button
                onClick={clear}
                variant="outline"
                className="border-white/20 text-white bg-white/10 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-300 gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="recipients">
          <TabsList className="mb-6 bg-white border border-border shadow-xs flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="recipients" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Penerima Aid</span>
              <span className="sm:hidden">Aid</span>
            </TabsTrigger>
            <TabsTrigger value="bantuan-penerima" className="gap-1.5">
              <HandHeart className="w-4 h-4" />
              <span className="hidden sm:inline">Bantuan Pasca Bencana</span>
              <span className="sm:hidden">Bantuan</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Pengaduan
            </TabsTrigger>
            <TabsTrigger value="publications" className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              Publikasi
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-1.5">
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Link Footer</span>
              <span className="sm:hidden">Link</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <UserCog className="w-4 h-4" />
              <span className="hidden sm:inline">Daftar User</span>
              <span className="sm:hidden">User</span>
            </TabsTrigger>
            <TabsTrigger value="validators" className="gap-1.5">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Validasi</span>
              <span className="sm:hidden">Validasi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipients">
            <AidRecipientsTab />
          </TabsContent>

          <TabsContent value="bantuan-penerima">
            <BantuanPenerimaSummaryTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="publications">
            <PublicationsTab />
          </TabsContent>

          <TabsContent value="links">
            <LinksTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="validators">
            <ValidatorManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AdminPanelPasswordPage() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center section-pattern">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPrompt />;
  }

  return <AdminPanelContent />;
}
