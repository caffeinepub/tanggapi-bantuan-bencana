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
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Filter,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import type { DisasterVictim, ValidationRecord } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddDisasterVictim,
  useAddValidationRecord,
  useDeleteDisasterVictim,
  useDeleteValidationRecord,
  useGetAllDisasterVictims,
  useGetAllValidationRecords,
  useIsCallerAdmin,
  useIsCallerAdminOrValidator,
  useUpdateDisasterVictim,
  useUpdateValidationStatus,
} from "../hooks/useQueries";
import { formatCurrency, formatDateId, newBigIntId } from "../utils/format";

// ─── Status Helpers ────────────────────────────────────────────────────────────

function PhysicalConditionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    baik: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "luka ringan": "bg-yellow-50 text-yellow-700 border border-yellow-200",
    "luka berat": "bg-orange-50 text-orange-700 border border-orange-200",
    "meninggal dunia": "bg-red-50 text-red-700 border border-red-200",
  };
  const labels: Record<string, string> = {
    baik: "Baik",
    "luka ringan": "Luka Ringan",
    "luka berat": "Luka Berat",
    "meninggal dunia": "Meninggal Dunia",
  };
  const style =
    styles[status] ?? "bg-gray-50 text-gray-600 border border-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {labels[status] ?? status}
    </span>
  );
}

function DamageLevelBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "tidak ada": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    ringan: "bg-blue-50 text-blue-700 border border-blue-200",
    sedang: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    berat: "bg-orange-50 text-orange-700 border border-orange-200",
    "total/hancur": "bg-red-50 text-red-700 border border-red-200",
  };
  const labels: Record<string, string> = {
    "tidak ada": "Tidak Ada",
    ringan: "Ringan",
    sedang: "Sedang",
    berat: "Berat",
    "total/hancur": "Total/Hancur",
  };
  const style =
    styles[status] ?? "bg-gray-50 text-gray-600 border border-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {labels[status] ?? status}
    </span>
  );
}

function ValidationStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: ReactNode }
  > = {
    menunggu: {
      label: "Menunggu",
      className: "bg-gray-50 text-gray-600 border border-gray-200",
      icon: <AlertTriangle className="w-3 h-3 mr-1" />,
    },
    divalidasi: {
      label: "Divalidasi",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    ditolak: {
      label: "Ditolak",
      className: "bg-red-50 text-red-700 border border-red-200",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
  };
  const c = config[status] ?? config.menunggu;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        c.className,
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function NeedTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    rehab: "bg-teal-50 text-teal-700 border border-teal-200",
    rekon: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    logistik: "bg-orange-50 text-orange-700 border border-orange-200",
    kesehatan: "bg-green-50 text-green-700 border border-green-200",
    pendidikan: "bg-violet-50 text-violet-700 border border-violet-200",
    psikososial: "bg-pink-50 text-pink-700 border border-pink-200",
  };
  const labels: Record<string, string> = {
    rehab: "Rehabilitasi",
    rekon: "Rekonstruksi",
    logistik: "Logistik",
    kesehatan: "Kesehatan",
    pendidikan: "Pendidikan",
    psikososial: "Psikososial",
  };
  const style =
    styles[type] ?? "bg-gray-50 text-gray-600 border border-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        style,
      )}
    >
      {labels[type] ?? type}
    </span>
  );
}

// ─── Empty Defaults ────────────────────────────────────────────────────────────

const EMPTY_VICTIM: Omit<DisasterVictim, "id" | "registeredBy"> = {
  nik: "",
  fullName: "",
  rt: "",
  rw: "",
  kelurahan: "",
  kecamatan: "",
  kabupaten: "",
  address: "",
  disasterType: "",
  disasterDate: BigInt(Date.now()),
  physicalCondition: "baik",
  damageLevel: "tidak ada",
  lossDescription: "",
  registrationDate: BigInt(Date.now()),
};

const EMPTY_VALIDATION: Omit<
  ValidationRecord,
  "id" | "createdBy" | "createdDate"
> = {
  victimId: BigInt(0),
  needType: "",
  needDescription: "",
  estimatedValue: BigInt(0),
  validationStatus: "menunggu",
  validatorNotes: "",
};

// ─── Victim Detail Dialog ─────────────────────────────────────────────────────

function VictimDetailDialog({
  victim,
  onClose,
  isAdmin,
  isValidator,
}: {
  victim: DisasterVictim | null;
  onClose: () => void;
  isAdmin: boolean;
  isValidator: boolean;
}) {
  const { data: records, isLoading } = useGetAllValidationRecords(
    isAdmin || isValidator,
  );
  const victimRecords = useMemo(() => {
    if (!records || !victim) return [];
    return records.filter((r) => r.victimId === victim.id);
  }, [records, victim]);

  if (!victim) return null;

  return (
    <Dialog open={!!victim} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Detail Korban: {victim.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-3 bg-secondary/30 rounded-xl p-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">NIK</p>
              <p className="text-sm font-medium font-mono">{victim.nik}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Jenis Bencana
              </p>
              <p className="text-sm font-medium capitalize">
                {victim.disasterType}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Lokasi</p>
              <p className="text-sm font-medium">
                {victim.kelurahan}, {victim.kecamatan}, {victim.kabupaten}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Tanggal Bencana
              </p>
              <p className="text-sm font-medium">
                {formatDateId(victim.disasterDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Kondisi Fisik
              </p>
              <PhysicalConditionBadge status={victim.physicalCondition} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                Tingkat Kerusakan
              </p>
              <DamageLevelBadge status={victim.damageLevel} />
            </div>
            {victim.lossDescription && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Keterangan Kehilangan
                </p>
                <p className="text-sm">{victim.lossDescription}</p>
              </div>
            )}
          </div>

          {/* Validation Records */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Data Kebutuhan & Validasi
              <Badge variant="secondary" className="text-xs">
                {victimRecords.length}
              </Badge>
            </h4>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : victimRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm bg-secondary/20 rounded-xl">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
                Belum ada data kebutuhan
              </div>
            ) : (
              <div className="space-y-2">
                {victimRecords.map((rec) => (
                  <div
                    key={String(rec.id)}
                    className="border border-border rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <NeedTypeBadge type={rec.needType} />
                        <ValidationStatusBadge status={rec.validationStatus} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateId(rec.createdDate)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {rec.needDescription}
                    </p>
                    {rec.estimatedValue > BigInt(0) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimasi: {formatCurrency(rec.estimatedValue)}
                      </p>
                    )}
                    {rec.validatorNotes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Catatan: {rec.validatorNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Disaster Victims Tab ─────────────────────────────────────────────────────

function DisasterVictimsTab({
  isAdmin,
  isValidator,
}: {
  isAdmin: boolean;
  isValidator: boolean;
}) {
  const [search, setSearch] = useState("");
  const [editingVictim, setEditingVictim] = useState<DisasterVictim | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [detailVictim, setDetailVictim] = useState<DisasterVictim | null>(null);

  const handleBuatPenerima = (v: DisasterVictim) => {
    // Navigate to penerima bantuan page with victim prefill via URL param
    window.location.href = `/penerima-bantuan?victimId=${v.id}`;
  };

  const { identity } = useInternetIdentity();

  const [form, setForm] =
    useState<Omit<DisasterVictim, "id" | "registeredBy">>(EMPTY_VICTIM);

  const { data: victims, isLoading } = useGetAllDisasterVictims();
  const addVictim = useAddDisasterVictim();
  const updateVictim = useUpdateDisasterVictim();
  const deleteVictim = useDeleteDisasterVictim();

  const filtered = useMemo(() => {
    if (!search.trim()) return victims ?? [];
    const term = search.toLowerCase();
    return (victims ?? []).filter(
      (v) =>
        v.fullName.toLowerCase().includes(term) ||
        v.nik.includes(term) ||
        v.kabupaten.toLowerCase().includes(term) ||
        v.disasterType.toLowerCase().includes(term),
    );
  }, [victims, search]);

  const openAdd = () => {
    setEditingVictim(null);
    setForm({
      ...EMPTY_VICTIM,
      disasterDate: BigInt(Date.now()),
      registrationDate: BigInt(Date.now()),
    });
    setIsFormOpen(true);
  };

  const openEdit = (v: DisasterVictim) => {
    setEditingVictim(v);
    setForm({
      nik: v.nik,
      fullName: v.fullName,
      rt: v.rt,
      rw: v.rw,
      kelurahan: v.kelurahan,
      kecamatan: v.kecamatan,
      kabupaten: v.kabupaten,
      address: v.address,
      disasterType: v.disasterType,
      disasterDate: v.disasterDate,
      physicalCondition: v.physicalCondition,
      damageLevel: v.damageLevel,
      lossDescription: v.lossDescription,
      registrationDate: v.registrationDate,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !form.nik ||
      !form.fullName ||
      !form.kabupaten ||
      !form.disasterType ||
      !form.physicalCondition
    ) {
      toast.error(
        "NIK, Nama, Kabupaten, Jenis Bencana, dan Kondisi Fisik wajib diisi",
      );
      return;
    }
    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    try {
      if (editingVictim) {
        await updateVictim.mutateAsync({
          ...form,
          id: editingVictim.id,
          registeredBy: editingVictim.registeredBy,
        });
        toast.success("Data korban diperbarui");
      } else {
        await addVictim.mutateAsync({
          ...form,
          id: newBigIntId(),
          registeredBy: principal,
        });
        toast.success("Data korban ditambahkan");
      }
      setIsFormOpen(false);
    } catch {
      toast.error("Operasi gagal");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteVictim.mutateAsync(deletingId);
      toast.success("Data korban dihapus");
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
            placeholder="Cari nama, NIK, kabupaten, jenis bencana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {(isAdmin || isValidator) && (
          <Button onClick={openAdd} className="bg-primary text-white gap-2">
            <Plus className="w-4 h-4" />
            Tambah Korban
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Nama / NIK</TableHead>
              <TableHead className="hidden md:table-cell">
                Kab/Kecamatan
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Jenis Bencana
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Kondisi Fisik
              </TableHead>
              <TableHead className="hidden lg:table-cell">Kerusakan</TableHead>
              <TableHead className="hidden xl:table-cell">Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c", "d", "e"].map((k) => (
                  <TableRow key={k}>
                    {["1", "2", "3", "4", "5", "6", "7"].map((c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((v) => (
                  <TableRow
                    key={String(v.id)}
                    className="hover:bg-secondary/20 cursor-pointer"
                    onClick={() => setDetailVictim(v)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{v.fullName}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {v.nik}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <div>
                        <p>{v.kabupaten}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.kecamatan}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm capitalize">
                        {v.disasterType}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <PhysicalConditionBadge status={v.physicalCondition} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <DamageLevelBadge status={v.damageLevel} />
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {formatDateId(v.disasterDate)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {(isAdmin || isValidator) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Buat Data Penerima Bantuan"
                            onClick={() => handleBuatPenerima(v)}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {(isAdmin || isValidator) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(v)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(v.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Belum ada data korban terdampak bencana</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-1 mt-2">
        <p className="text-xs text-muted-foreground">
          Klik baris untuk melihat detail dan data kebutuhan korban.
        </p>
        {(isAdmin || isValidator) && (
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            Klik ikon hijau untuk membuat data Penerima Bantuan dari korban ini.
          </p>
        )}
      </div>

      {/* Victim Detail Dialog */}
      <VictimDetailDialog
        victim={detailVictim}
        onClose={() => setDetailVictim(null)}
        isAdmin={isAdmin}
        isValidator={isValidator}
      />

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingVictim
                ? "Edit Data Korban Bencana"
                : "Tambah Data Korban Bencana"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Nama Lengkap *</Label>
              <Input
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
                placeholder="Nama lengkap korban"
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
                maxLength={16}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>RT</Label>
                <Input
                  value={form.rt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rt: e.target.value }))
                  }
                  placeholder="001"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>RW</Label>
                <Input
                  value={form.rw}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rw: e.target.value }))
                  }
                  placeholder="002"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Kelurahan/Desa</Label>
              <Input
                value={form.kelurahan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kelurahan: e.target.value }))
                }
                placeholder="Nama kelurahan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Kecamatan</Label>
              <Input
                value={form.kecamatan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kecamatan: e.target.value }))
                }
                placeholder="Nama kecamatan"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Kabupaten/Kota *</Label>
              <Input
                value={form.kabupaten}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kabupaten: e.target.value }))
                }
                placeholder="Kabupaten/Kota"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Jenis Bencana *</Label>
              <Select
                value={form.disasterType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, disasterType: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pilih jenis bencana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banjir">Banjir</SelectItem>
                  <SelectItem value="gempa bumi">Gempa Bumi</SelectItem>
                  <SelectItem value="tanah longsor">Tanah Longsor</SelectItem>
                  <SelectItem value="tsunami">Tsunami</SelectItem>
                  <SelectItem value="kebakaran">Kebakaran</SelectItem>
                  <SelectItem value="puting beliung">Puting Beliung</SelectItem>
                  <SelectItem value="kekeringan">Kekeringan</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Alamat Lengkap</Label>
              <Textarea
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Alamat lengkap"
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>
            <div>
              <Label>Tanggal Bencana</Label>
              <Input
                type="date"
                value={
                  form.disasterDate
                    ? new Date(Number(form.disasterDate))
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    disasterDate: BigInt(new Date(e.target.value).getTime()),
                  }))
                }
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Kondisi Fisik *</Label>
              <Select
                value={form.physicalCondition}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, physicalCondition: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="luka ringan">Luka Ringan</SelectItem>
                  <SelectItem value="luka berat">Luka Berat</SelectItem>
                  <SelectItem value="meninggal dunia">
                    Meninggal Dunia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tingkat Kerusakan</Label>
              <Select
                value={form.damageLevel}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, damageLevel: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tidak ada">Tidak Ada</SelectItem>
                  <SelectItem value="ringan">Ringan</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="berat">Berat</SelectItem>
                  <SelectItem value="total/hancur">Total/Hancur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Keterangan Kehilangan</Label>
              <Textarea
                value={form.lossDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lossDescription: e.target.value }))
                }
                placeholder="Deskripsi kehilangan aset, properti, dll."
                rows={3}
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
              disabled={addVictim.isPending || updateVictim.isPending}
              className="bg-primary text-white gap-2"
            >
              {(addVictim.isPending || updateVictim.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {editingVictim ? "Perbarui" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Korban?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data korban dan semua catatan
              validasi terkait akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVictim.isPending ? (
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

// ─── Validation Records Tab ───────────────────────────────────────────────────

function ValidationRecordsTab({
  isAdmin,
  isValidator,
}: {
  isAdmin: boolean;
  isValidator: boolean;
}) {
  const [filterStatus, setFilterStatus] = useState("semua");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isValidateOpen, setIsValidateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ValidationRecord | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const { identity } = useInternetIdentity();

  const [addForm, setAddForm] =
    useState<Omit<ValidationRecord, "id" | "createdBy" | "createdDate">>(
      EMPTY_VALIDATION,
    );
  const [validateForm, setValidateForm] = useState({
    status: "menunggu",
    notes: "",
  });

  const { data: records, isLoading } = useGetAllValidationRecords(
    isAdmin || isValidator,
  );
  const { data: victims } = useGetAllDisasterVictims();
  const addRecord = useAddValidationRecord();
  const updateStatus = useUpdateValidationStatus();
  const deleteRecord = useDeleteValidationRecord();

  const filtered = useMemo(() => {
    const all = records ?? [];
    if (filterStatus === "semua") return all;
    return all.filter((r) => r.validationStatus === filterStatus);
  }, [records, filterStatus]);

  const getVictimName = (victimId: bigint) => {
    const v = (victims ?? []).find((vic) => vic.id === victimId);
    return v ? v.fullName : `ID: ${victimId}`;
  };

  const openAdd = () => {
    setAddForm({
      ...EMPTY_VALIDATION,
      victimId: victims?.[0]?.id ?? BigInt(0),
    });
    setIsAddOpen(true);
  };

  const openValidate = (rec: ValidationRecord) => {
    setEditingRecord(rec);
    setValidateForm({
      status: rec.validationStatus,
      notes: rec.validatorNotes,
    });
    setIsValidateOpen(true);
  };

  const handleAddSubmit = async () => {
    if (!addForm.victimId || !addForm.needType || !addForm.needDescription) {
      toast.error("Korban, Jenis Kebutuhan, dan Deskripsi wajib diisi");
      return;
    }
    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    try {
      await addRecord.mutateAsync({
        ...addForm,
        id: newBigIntId(),
        createdBy: principal,
        createdDate: BigInt(Date.now()),
      });
      toast.success("Data kebutuhan ditambahkan");
      setIsAddOpen(false);
    } catch {
      toast.error("Gagal menambahkan data");
    }
  };

  const handleValidateSubmit = async () => {
    if (!editingRecord) return;
    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }
    try {
      await updateStatus.mutateAsync({
        id: editingRecord.id,
        status: validateForm.status,
        notes: validateForm.notes,
        validatedBy: principal,
      });
      toast.success("Status validasi diperbarui");
      setIsValidateOpen(false);
    } catch {
      toast.error("Gagal memperbarui validasi");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRecord.mutateAsync(deletingId);
      toast.success("Data kebutuhan dihapus");
    } catch {
      toast.error("Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Status</SelectItem>
              <SelectItem value="menunggu">Menunggu</SelectItem>
              <SelectItem value="divalidasi">Divalidasi</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
        {(isAdmin || isValidator) && (
          <Button onClick={openAdd} className="bg-primary text-white gap-2">
            <Plus className="w-4 h-4" />
            Tambah Kebutuhan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Korban</TableHead>
              <TableHead className="hidden md:table-cell">
                Jenis Kebutuhan
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Estimasi Nilai
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">
                Catatan Validator
              </TableHead>
              <TableHead className="hidden xl:table-cell">Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? ["a", "b", "c", "d"].map((k) => (
                  <TableRow key={k}>
                    {["1", "2", "3", "4", "5", "6", "7"].map((c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.map((rec) => (
                  <TableRow
                    key={String(rec.id)}
                    className="hover:bg-secondary/20"
                  >
                    <TableCell>
                      <p className="font-medium text-sm">
                        {getVictimName(rec.victimId)}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {rec.needType}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <NeedTypeBadge type={rec.needType} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {rec.estimatedValue > BigInt(0)
                        ? formatCurrency(rec.estimatedValue)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <ValidationStatusBadge status={rec.validationStatus} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px]">
                      <p className="truncate">{rec.validatorNotes || "-"}</p>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {formatDateId(rec.createdDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {(isAdmin || isValidator) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openValidate(rec)}
                            title="Validasi"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(rec.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>Belum ada data kebutuhan</p>
          </div>
        )}
      </div>

      {/* Add Kebutuhan Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Tambah Data Kebutuhan Bantuan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Korban Bencana *</Label>
              <Select
                value={String(addForm.victimId)}
                onValueChange={(v) =>
                  setAddForm((f) => ({ ...f, victimId: BigInt(v) }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pilih korban" />
                </SelectTrigger>
                <SelectContent>
                  {(victims ?? []).map((v) => (
                    <SelectItem key={String(v.id)} value={String(v.id)}>
                      {v.fullName} - {v.nik}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Jenis Kebutuhan *</Label>
              <Select
                value={addForm.needType}
                onValueChange={(v) =>
                  setAddForm((f) => ({ ...f, needType: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pilih jenis kebutuhan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rehab">Rehabilitasi (Rehab)</SelectItem>
                  <SelectItem value="rekon">Rekonstruksi (Rekon)</SelectItem>
                  <SelectItem value="logistik">Logistik</SelectItem>
                  <SelectItem value="kesehatan">Kesehatan</SelectItem>
                  <SelectItem value="pendidikan">Pendidikan</SelectItem>
                  <SelectItem value="psikososial">Psikososial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deskripsi Kebutuhan *</Label>
              <Textarea
                value={addForm.needDescription}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    needDescription: e.target.value,
                  }))
                }
                placeholder="Jelaskan kebutuhan bantuan secara detail..."
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>
            <div>
              <Label>Estimasi Nilai Bantuan (Rp)</Label>
              <Input
                type="number"
                value={Number(addForm.estimatedValue)}
                onChange={(e) =>
                  setAddForm((f) => ({
                    ...f,
                    estimatedValue: BigInt(e.target.value || "0"),
                  }))
                }
                placeholder="0"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={addRecord.isPending}
              className="bg-primary text-white gap-2"
            >
              {addRecord.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validate Dialog */}
      <Dialog open={isValidateOpen} onOpenChange={setIsValidateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Validasi Data Kebutuhan
            </DialogTitle>
          </DialogHeader>
          {editingRecord && (
            <div className="space-y-4 py-2">
              <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {getVictimName(editingRecord.victimId)}
                </p>
                <p className="text-muted-foreground mt-1">
                  {editingRecord.needDescription}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <NeedTypeBadge type={editingRecord.needType} />
                  {editingRecord.estimatedValue > BigInt(0) && (
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(editingRecord.estimatedValue)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label>Status Validasi *</Label>
                <Select
                  value={validateForm.status}
                  onValueChange={(v) =>
                    setValidateForm((f) => ({ ...f, status: v }))
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="divalidasi">Divalidasi</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catatan Validator</Label>
                <Textarea
                  value={validateForm.notes}
                  onChange={(e) =>
                    setValidateForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Tambahkan catatan validasi..."
                  rows={3}
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsValidateOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleValidateSubmit}
              disabled={updateStatus.isPending}
              className="bg-primary text-white gap-2"
            >
              {updateStatus.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan Validasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kebutuhan?</AlertDialogTitle>
            <AlertDialogDescription>
              Data kebutuhan bantuan ini akan dihapus permanen dan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRecord.isPending ? (
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

// ─── Validasi Page ─────────────────────────────────────────────────────────────

export default function ValidasiPage() {
  const { data: isAdminOrValidatorICP } = useIsCallerAdminOrValidator();
  const { data: isAdminICP } = useIsCallerAdmin();
  const { identity } = useInternetIdentity();

  // If user is logged in via Internet Identity, treat them as having access.
  // The backend will reject unauthorized calls with proper error messages.
  // This fixes the race condition where the backend hasn't registered the new user yet.
  const isAdminOrValidator = !!isAdminOrValidatorICP || !!identity;
  const isAdmin = !!isAdminICP || !!identity;

  const isValidator = !!(isAdminOrValidator && !isAdmin);

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background section-pattern">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm p-8 bg-white rounded-2xl shadow-card-hover border border-border"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold mb-2">Silakan Login</h2>
          <p className="text-muted-foreground text-sm">
            Anda perlu login terlebih dahulu untuk mengakses halaman Validasi
            Data.
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
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-3xl font-bold text-white">
                  Validasi Data Bencana
                </h1>
                {isAdmin ? (
                  <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                    ADMIN
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                    VALIDATOR
                  </Badge>
                )}
              </div>
              <p className="text-white/60 text-sm">
                Kelola data penduduk terdampak bencana dan validasi kebutuhan
                bantuan rehab &amp; rekonstruksi
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="victims">
          <TabsList className="mb-6 bg-white border border-border shadow-xs">
            <TabsTrigger value="victims" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Data Penduduk Terdampak</span>
              <span className="sm:hidden">Penduduk</span>
            </TabsTrigger>
            <TabsTrigger value="validations" className="gap-1.5">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Validasi Kebutuhan</span>
              <span className="sm:hidden">Validasi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="victims">
            <DisasterVictimsTab isAdmin={!!isAdmin} isValidator={isValidator} />
          </TabsContent>

          <TabsContent value="validations">
            <ValidationRecordsTab
              isAdmin={!!isAdmin}
              isValidator={isValidator}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
