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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  FileText,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserSearch,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { BantuanPenerima, DisasterVictim } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBantuanPenerima,
  useDeleteBantuanPenerima,
  useGetAllBantuanPenerima,
  useGetAllDisasterVictims,
  useIsCallerAdmin,
  useIsCallerAdminOrValidator,
  useUpdateBantuanPenerima,
  useUpdateBantuanPenerimaStatus,
} from "../hooks/useQueries";
import { formatDateId, newBigIntId } from "../utils/format";

// ─── Types & Constants ────────────────────────────────────────────────────────

const VALIDASI_STATUS = [
  "semua",
  "baru",
  "diproses",
  "ditindaklanjuti",
] as const;
type ValidasiFilter = (typeof VALIDASI_STATUS)[number];

const EMPTY_FORM: Omit<
  BantuanPenerima,
  "id" | "createdBy" | "createdDate" | "updatedDate"
> = {
  nik: "",
  nama: "",
  alamat: "",
  keperluanBantuan: "",
  keterangan: "",
  prosesTindakLanjut: "",
  instansiPembantu: "",
  validasiStatus: "baru",
  tindakLanjutKeterangan: "",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function ValidasiStatusBadge({ status }: { status: string }) {
  if (status === "ditindaklanjuti") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1.5 font-medium text-xs">
        <CheckCircle2 className="w-3 h-3" />
        Ditindaklanjuti
      </Badge>
    );
  }
  if (status === "diproses") {
    return (
      <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1.5 font-medium text-xs">
        <Clock className="w-3 h-3" />
        Diproses
      </Badge>
    );
  }
  return (
    <Badge className="bg-slate-50 text-slate-600 border border-slate-200 gap-1.5 font-medium text-xs">
      <FileText className="w-3 h-3" />
      Baru
    </Badge>
  );
}

// ─── Victim Lookup Combobox ───────────────────────────────────────────────────

function VictimLookup({
  victims,
  selectedVictim,
  onSelect,
  onClear,
}: {
  victims: DisasterVictim[];
  selectedVictim: DisasterVictim | null;
  onSelect: (victim: DisasterVictim) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (selectedVictim) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800 truncate">
            {selectedVictim.fullName}
          </p>
          <p className="text-xs text-emerald-600 font-mono">
            NIK: {selectedVictim.nik} &bull; {selectedVictim.disasterType}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
          title="Hapus pilihan"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground gap-2 font-normal"
        >
          <UserSearch className="w-4 h-4" />
          Cari dari Data Validasi Bencana...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari nama atau NIK korban..." />
          <CommandList className="max-h-64">
            <CommandEmpty>
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Users className="w-6 h-6 mx-auto mb-1 opacity-30" />
                Tidak ada data korban ditemukan
              </div>
            </CommandEmpty>
            <CommandGroup heading={`${victims.length} data korban tersedia`}>
              {victims.map((v) => (
                <CommandItem
                  key={String(v.id)}
                  value={`${v.fullName} ${v.nik} ${v.kabupaten}`}
                  onSelect={() => {
                    onSelect(v);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start gap-0.5 py-2"
                >
                  <span className="font-medium text-sm">{v.fullName}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    NIK: {v.nik} &bull; {v.kabupaten} &bull;{" "}
                    <span className="capitalize">{v.disasterType}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Status Update Dialog ─────────────────────────────────────────────────────

function StatusUpdateDialog({
  item,
  open,
  onClose,
}: {
  item: BantuanPenerima | null;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState("baru");
  const [keterangan, setKeterangan] = useState("");
  const [instansi, setInstansi] = useState("");
  const updateStatus = useUpdateBantuanPenerimaStatus();

  const handleOpen = () => {
    if (item) {
      setStatus(item.validasiStatus);
      setKeterangan(item.tindakLanjutKeterangan);
      setInstansi(item.instansiPembantu);
    }
  };

  const handleSave = async () => {
    if (!item) return;
    try {
      await updateStatus.mutateAsync({
        id: item.id,
        validasiStatus: status,
        tindakLanjutKeterangan: keterangan,
        instansiPembantu: instansi,
      });
      toast.success("Status validasi diperbarui");
      onClose();
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        else onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Update Status Validasi
          </DialogTitle>
        </DialogHeader>
        {item && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-sm text-foreground">
                {item.nama}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                NIK: {item.nik}
              </p>
            </div>
            <div>
              <Label>Status Validasi</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baru">Baru</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="ditindaklanjuti">
                    Ditindaklanjuti
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Instansi Pembantu</Label>
              <Input
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Nama instansi/lembaga yang membantu"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Keterangan Tindak Lanjut</Label>
              <Textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Keterangan detail tindak lanjut..."
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateStatus.isPending}
            className="bg-primary text-white gap-2"
          >
            {updateStatus.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Simpan Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Form Dialog ──────────────────────────────────────────────────────────────

function BantuanFormDialog({
  editing,
  open,
  onClose,
  isAdminOrValidator,
  prefillVictim,
  victims,
}: {
  editing: BantuanPenerima | null;
  open: boolean;
  onClose: () => void;
  isAdminOrValidator: boolean;
  prefillVictim?: DisasterVictim | null;
  victims: DisasterVictim[];
}) {
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [selectedVictim, setSelectedVictim] = useState<DisasterVictim | null>(
    null,
  );
  const addBantuan = useAddBantuanPenerima();
  const updateBantuan = useUpdateBantuanPenerima();
  const { identity } = useInternetIdentity();

  const applyVictimToForm = useCallback((victim: DisasterVictim) => {
    const addrParts = [
      victim.rt ? `RT ${victim.rt}` : "",
      victim.rw ? `RW ${victim.rw}` : "",
      victim.kelurahan,
      victim.kecamatan,
      victim.kabupaten,
      victim.address,
    ]
      .filter(Boolean)
      .join(", ");

    setForm((f) => ({
      ...f,
      nik: victim.nik,
      nama: victim.fullName,
      alamat: addrParts || victim.address,
      keterangan: `Korban bencana ${victim.disasterType}. Kondisi: ${victim.physicalCondition}. Kerusakan: ${victim.damageLevel}.`,
    }));
  }, []);

  // Apply prefill victim when dialog opens
  useEffect(() => {
    if (open && prefillVictim && !editing) {
      setSelectedVictim(prefillVictim);
      applyVictimToForm(prefillVictim);
    }
  }, [open, prefillVictim, editing, applyVictimToForm]);

  const handleVictimSelect = (victim: DisasterVictim) => {
    setSelectedVictim(victim);
    applyVictimToForm(victim);
  };

  const handleVictimClear = () => {
    setSelectedVictim(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleOpenChange = (v: boolean) => {
    if (v) {
      if (editing) {
        setSelectedVictim(null);
        setForm({
          nik: editing.nik,
          nama: editing.nama,
          alamat: editing.alamat,
          keperluanBantuan: editing.keperluanBantuan,
          keterangan: editing.keterangan,
          prosesTindakLanjut: editing.prosesTindakLanjut,
          instansiPembantu: editing.instansiPembantu,
          validasiStatus: editing.validasiStatus,
          tindakLanjutKeterangan: editing.tindakLanjutKeterangan,
        });
      } else if (!prefillVictim) {
        setSelectedVictim(null);
        setForm({ ...EMPTY_FORM });
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!form.nik.trim() || !form.nama.trim() || !form.alamat.trim()) {
      toast.error("NIK, Nama, dan Alamat wajib diisi");
      return;
    }
    if (form.nik.length !== 16) {
      toast.error("NIK harus 16 digit");
      return;
    }
    if (!form.keperluanBantuan.trim()) {
      toast.error("Keperluan bantuan wajib diisi");
      return;
    }
    const principal = identity?.getPrincipal();
    try {
      const now = BigInt(Date.now());
      if (editing) {
        await updateBantuan.mutateAsync({
          ...editing,
          ...form,
          updatedDate: now,
        });
        toast.success("Data penerima bantuan diperbarui");
      } else {
        // Use actual principal if available, otherwise use anonymous for password admins
        const creatorPrincipal: Principal = principal ?? Principal.anonymous();
        await addBantuan.mutateAsync({
          id: newBigIntId(),
          ...form,
          createdBy: creatorPrincipal,
          createdDate: now,
          updatedDate: now,
        });
        toast.success("Data penerima bantuan ditambahkan");
      }
      onClose();
    } catch {
      toast.error(
        "Gagal menyimpan data. Pastikan koneksi internet stabil dan coba lagi.",
      );
    }
  };

  if (!isAdminOrValidator) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editing
              ? "Edit Data Penerima Bantuan"
              : "Tambah Data Penerima Bantuan"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Victim Lookup - only for new entries */}
          {!editing && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <UserSearch className="w-3.5 h-3.5 text-primary" />
                Sinkronisasi dari Data Validasi Bencana
              </Label>
              <VictimLookup
                victims={victims}
                selectedVictim={selectedVictim}
                onSelect={handleVictimSelect}
                onClear={handleVictimClear}
              />
              {victims.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Belum ada data korban di Validasi Data Bencana. Input manual
                  di bawah.
                </p>
              )}
              {selectedVictim && (
                <p className="text-xs text-emerald-600">
                  Data NIK, Nama, dan Alamat telah terisi otomatis dari data
                  validasi. Periksa dan lengkapi keperluan bantuan.
                </p>
              )}
              {!selectedVictim && victims.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Pilih korban dari data validasi untuk mengisi NIK, nama, dan
                  alamat secara otomatis. Atau isi manual di bawah.
                </p>
              )}
            </div>
          )}

          {/* Separator */}
          {!editing && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Data Penerima
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="md:col-span-2">
              <Label>
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.nama}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nama: e.target.value }))
                }
                placeholder="Nama lengkap penerima bantuan"
                className="mt-1.5"
              />
            </div>

            {/* NIK */}
            <div>
              <Label>
                NIK <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.nik}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nik: e.target.value.replace(/\D/g, "").slice(0, 16),
                  }))
                }
                placeholder="16 digit NIK"
                maxLength={16}
                className="mt-1.5 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.nik.length}/16 digit
              </p>
            </div>

            {/* Status Validasi */}
            <div>
              <Label>Status Validasi</Label>
              <Select
                value={form.validasiStatus}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, validasiStatus: v }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baru">Baru</SelectItem>
                  <SelectItem value="diproses">Diproses</SelectItem>
                  <SelectItem value="ditindaklanjuti">
                    Ditindaklanjuti
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Alamat */}
            <div className="md:col-span-2">
              <Label>
                Alamat Lengkap <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.alamat}
                onChange={(e) =>
                  setForm((f) => ({ ...f, alamat: e.target.value }))
                }
                placeholder="Alamat lengkap penerima bantuan (RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten)"
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Keperluan Bantuan */}
            <div className="md:col-span-2">
              <Label>
                Keperluan Bantuan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={form.keperluanBantuan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, keperluanBantuan: e.target.value }))
                }
                placeholder="Deskripsikan keperluan bantuan yang dibutuhkan (logistik, hunian, kesehatan, dll)"
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Keterangan */}
            <div className="md:col-span-2">
              <Label>Keterangan</Label>
              <Textarea
                value={form.keterangan}
                onChange={(e) =>
                  setForm((f) => ({ ...f, keterangan: e.target.value }))
                }
                placeholder="Keterangan umum tambahan..."
                rows={2}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Proses & Tindak Lanjut */}
            <div className="md:col-span-2">
              <Label>Proses & Tindak Lanjut Pihak Terkait</Label>
              <Textarea
                value={form.prosesTindakLanjut}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    prosesTindakLanjut: e.target.value,
                  }))
                }
                placeholder="Catatan proses dan tindak lanjut dari pihak terkait..."
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>

            {/* Instansi Pembantu */}
            <div>
              <Label>Instansi Pembantu</Label>
              <Input
                value={form.instansiPembantu}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instansiPembantu: e.target.value }))
                }
                placeholder="Nama instansi/lembaga yang membantu"
                className="mt-1.5"
              />
            </div>

            {/* Tindak Lanjut Keterangan */}
            <div>
              <Label>Keterangan Tindak Lanjut</Label>
              <Input
                value={form.tindakLanjutKeterangan}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tindakLanjutKeterangan: e.target.value,
                  }))
                }
                placeholder="Detail keterangan tindak lanjut"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addBantuan.isPending || updateBantuan.isPending}
            className="bg-primary text-white gap-2"
          >
            {(addBantuan.isPending || updateBantuan.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {editing ? "Perbarui Data" : "Tambah Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Detail Expand ────────────────────────────────────────────────────────

function RowDetail({ item }: { item: BantuanPenerima }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="bg-muted/30 px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-t border-border/50">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Keperluan Bantuan
          </p>
          <p className="text-foreground leading-relaxed">
            {item.keperluanBantuan || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Keterangan
          </p>
          <p className="text-foreground leading-relaxed">
            {item.keterangan || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Proses & Tindak Lanjut
          </p>
          <p className="text-foreground leading-relaxed">
            {item.prosesTindakLanjut || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Instansi Pembantu
          </p>
          <p className="text-foreground flex items-center gap-1.5">
            {item.instansiPembantu ? (
              <>
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                {item.instansiPembantu}
              </>
            ) : (
              "-"
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Keterangan Tindak Lanjut
          </p>
          <p className="text-foreground leading-relaxed">
            {item.tindakLanjutKeterangan || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Tanggal Diperbarui
          </p>
          <p className="text-foreground">{formatDateId(item.updatedDate)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────

function SummaryCards({ data }: { data: BantuanPenerima[] }) {
  const total = data.length;
  const baru = data.filter((d) => d.validasiStatus === "baru").length;
  const diproses = data.filter((d) => d.validasiStatus === "diproses").length;
  const ditindak = data.filter(
    (d) => d.validasiStatus === "ditindaklanjuti",
  ).length;

  const cards = [
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
      icon: FileText,
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
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`${c.bg} rounded-xl p-4 border border-border/50`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                {c.label}
              </p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </div>
            <c.icon
              className={`w-5 h-5 ${c.color} opacity-60 shrink-0 mt-0.5`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// ─── Sample Data ──────────────────────────────────────────────────────────────

const SAMPLE_BANTUAN_DATA = [
  {
    nik: "1101010101010001",
    nama: "Ahmad Fauzi",
    alamat:
      "Jl. Pahlawan No. 12, RT 02/RW 03, Desa Peukan Bada, Kec. Peukan Bada, Aceh Besar",
    keperluanBantuan:
      "Perbaikan rumah rusak berat akibat banjir, kebutuhan logistik harian (sembako), dan obat-obatan",
    keterangan:
      "Korban banjir bandang 2024, rumah terendam 2 meter selama 3 hari",
    prosesTindakLanjut:
      "Tim BPBD sudah survey lokasi, sedang menunggu anggaran rehab",
    instansiPembantu: "BPBD Aceh Besar",
    validasiStatus: "diproses",
    tindakLanjutKeterangan: "Sudah diverifikasi oleh tim lapangan BPBD",
  },
  {
    nik: "1102020202020002",
    nama: "Siti Rahmah",
    alamat: "Gampong Pante Riek, Kec. Seunagan, Kab. Nagan Raya, Aceh",
    keperluanBantuan:
      "Bantuan hunian sementara, pakaian layak, dan kebutuhan bayi",
    keterangan:
      "Ibu dengan 2 anak balita, suami meninggal akibat gempa. Rumah roboh total",
    prosesTindakLanjut: "Ditempatkan di huntara, menunggu pembangunan huntetap",
    instansiPembantu: "Dinas Sosial Nagan Raya",
    validasiStatus: "ditindaklanjuti",
    tindakLanjutKeterangan: "Sudah menerima bantuan tahap 1, menunggu tahap 2",
  },
  {
    nik: "1103030303030003",
    nama: "Muhammadin",
    alamat: "Desa Suak Perbesi, Kec. Johan Pahlawan, Kab. Aceh Barat",
    keperluanBantuan:
      "Modal usaha tani untuk memulai kembali, alat pertanian, dan bibit",
    keterangan:
      "Petani yang kehilangan lahan dan peralatan akibat longsor. 5 anggota keluarga",
    prosesTindakLanjut:
      "Menunggu validasi dari dinas pertanian untuk bantuan alat dan bibit",
    instansiPembantu: "Dinas Pertanian Aceh Barat",
    validasiStatus: "baru",
    tindakLanjutKeterangan: "",
  },
  {
    nik: "1104040404040004",
    nama: "Nurlaila Dewi",
    alamat: "Gampong Blang Baro, Kec. Krueng Barona Jaya, Aceh Besar",
    keperluanBantuan:
      "Renovasi rumah rusak sedang, perlengkapan dapur, dan kasur",
    keterangan: "Janda lansia, 70 tahun. Rumah rusak sedang akibat banjir rob",
    prosesTindakLanjut:
      "Tim relawan RTIK sudah survey, data sudah dilaporkan ke BPBD",
    instansiPembantu: "Relawan TIK Indonesia",
    validasiStatus: "diproses",
    tindakLanjutKeterangan:
      "Data telah dilaporkan, menunggu SK penerima bantuan",
  },
  {
    nik: "1105050505050005",
    nama: "Teuku Iskandar",
    alamat:
      "Jl. Merdeka No. 45, Gampong Keude Bieng, Kec. Bireuen, Kab. Bireuen",
    keperluanBantuan:
      "Perbaikan atap rumah rusak berat, kebutuhan sanitasi dan air bersih",
    keterangan:
      "Kepala keluarga dengan 6 anggota, nelayan yang kehilangan perahu akibat abrasi",
    prosesTindakLanjut: "Perlu koordinasi dengan Dinas PUPR dan Dinas Kelautan",
    instansiPembantu: "BPBD Bireuen",
    validasiStatus: "ditindaklanjuti",
    tindakLanjutKeterangan:
      "Bantuan perbaikan atap sudah selesai, bantuan perahu dalam proses pengadaan",
  },
];

export default function PenerimaBantuanPage() {
  const [activeFilter, setActiveFilter] = useState<ValidasiFilter>("semua");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<bigint | null>(null);
  const [editingItem, setEditingItem] = useState<BantuanPenerima | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [statusItem, setStatusItem] = useState<BantuanPenerima | null>(null);
  const [prefillVictim, setPrefillVictim] = useState<DisasterVictim | null>(
    null,
  );
  const [isInitingData, setIsInitingData] = useState(false);

  // Check if user is authenticated via password-based admin panel
  const isPasswordAdmin = sessionStorage.getItem("admin_panel_auth") === "true";

  const { data: allData, isLoading } = useGetAllBantuanPenerima();
  const { data: allVictims = [] } = useGetAllDisasterVictims();
  const { data: isAdminOrValidatorICP } = useIsCallerAdminOrValidator();
  const { data: isAdminICP } = useIsCallerAdmin();
  const deleteBantuan = useDeleteBantuanPenerima();
  const addBantuanInit = useAddBantuanPenerima();
  const { identity } = useInternetIdentity();

  // Combine both auth methods
  const isAdminOrValidator = isPasswordAdmin || !!isAdminOrValidatorICP;
  const isAdmin = isPasswordAdmin || !!isAdminICP;

  // Check URL params for prefill victim (set by ValidasiPage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const victimId = params.get("victimId");
    if (victimId && allVictims.length > 0) {
      const victim = allVictims.find((v) => String(v.id) === victimId);
      if (victim) {
        setPrefillVictim(victim);
        setEditingItem(null);
        setIsFormOpen(true);
        // Clear the URL param without navigation
        const url = new URL(window.location.href);
        url.searchParams.delete("victimId");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [allVictims]);

  const filtered = useMemo(() => {
    let items = allData ?? [];
    if (activeFilter !== "semua") {
      items = items.filter((d) => d.validasiStatus === activeFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      items = items.filter(
        (d) =>
          d.nama.toLowerCase().includes(term) ||
          d.nik.includes(term) ||
          d.alamat.toLowerCase().includes(term),
      );
    }
    return items;
  }, [allData, activeFilter, search]);

  // Check if a penerima NIK already exists in validasi data
  const validasiNikSet = useMemo(
    () => new Set(allVictims.map((v) => v.nik)),
    [allVictims],
  );

  const openAdd = () => {
    setPrefillVictim(null);
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: BantuanPenerima) => {
    setPrefillVictim(null);
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBantuan.mutateAsync(deletingId);
      toast.success("Data penerima bantuan dihapus");
    } catch {
      toast.error("Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: bigint) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleInitSampleData = async () => {
    const principal = identity?.getPrincipal();
    setIsInitingData(true);
    let successCount = 0;
    let failCount = 0;
    try {
      const creatorPrincipal: Principal = principal ?? Principal.anonymous();
      const now = BigInt(Date.now());
      for (const item of SAMPLE_BANTUAN_DATA) {
        try {
          await addBantuanInit.mutateAsync({
            id: newBigIntId(),
            ...item,
            createdBy: creatorPrincipal,
            createdDate: now,
            updatedDate: now,
          });
          successCount++;
        } catch {
          failCount++;
        }
      }
      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} data sampel berhasil ditambahkan`);
      } else if (successCount > 0 && failCount > 0) {
        toast.success(
          `${successCount} data berhasil, ${failCount} data gagal ditambahkan`,
        );
      } else {
        toast.error(
          "Gagal menginisialisasi data sampel. Pastikan koneksi internet stabil.",
        );
      }
    } catch {
      toast.error(
        "Gagal menginisialisasi data sampel. Pastikan koneksi internet stabil.",
      );
    } finally {
      setIsInitingData(false);
    }
  };

  const filterLabels: Record<ValidasiFilter, string> = {
    semua: "Semua",
    baru: "Baru",
    diproses: "Diproses",
    ditindaklanjuti: "Ditindaklanjuti",
  };

  return (
    <div className="section-pattern min-h-screen">
      {/* Page Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-0.5">
                    Data Penerima Bantuan Pasca Bencana
                  </h1>
                  <p className="text-white/60 text-sm">
                    Sistem validasi dan pencatatan data penerima bantuan &bull;
                    Sinkron dengan Validasi Data Bencana
                  </p>
                </div>
              </div>
              {isAdminOrValidator && (
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {isAdmin && (
                    <Button
                      onClick={handleInitSampleData}
                      disabled={isInitingData}
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 gap-2 font-medium"
                    >
                      {isInitingData ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4" />
                      )}
                      {isInitingData ? "Memuat..." : "Init Data Sampel"}
                    </Button>
                  )}
                  <Button
                    onClick={openAdd}
                    className="bg-gold hover:bg-gold/90 text-navy font-semibold gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Data
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        {!isLoading && allData && <SummaryCards data={allData} />}
        {isLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((k) => (
              <Skeleton key={k} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-white border border-border rounded-xl p-1 shadow-xs">
            {VALIDASI_STATUS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeFilter === s
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {filterLabels[s]}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIK, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>

          {isAdminOrValidator && (
            <Button
              onClick={openAdd}
              className="bg-primary text-white gap-2 sm:hidden"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-10">No.</TableHead>
                <TableHead>Nama / NIK</TableHead>
                <TableHead className="hidden md:table-cell">Alamat</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Keperluan
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Instansi Pembantu
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Tgl. Input
                </TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? ["a", "b", "c", "d", "e"].map((k) => (
                    <TableRow key={k}>
                      {["1", "2", "3", "4", "5", "6", "7", "8"].map((c) => (
                        <TableCell key={c}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((item, index) => (
                    <>
                      <TableRow
                        key={String(item.id)}
                        className="hover:bg-secondary/20 cursor-pointer"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <TableCell className="text-sm text-muted-foreground font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm text-foreground">
                                  {item.nama}
                                </p>
                                {validasiNikSet.has(item.nik) && (
                                  <span title="Data tersinkron dengan Validasi Data Bencana">
                                    <Link2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-mono">
                                {item.nik}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[180px]">
                            {item.alamat || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[160px]">
                            {item.keperluanBantuan || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-sm text-muted-foreground line-clamp-1 max-w-[140px]">
                            {item.instansiPembantu || "-"}
                          </p>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <ValidasiStatusBadge status={item.validasiStatus} />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {formatDateId(item.createdDate)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Expand/Collapse Detail"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.id);
                              }}
                            >
                              {expandedId === item.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            {isAdminOrValidator && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Update Status"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStatusItem(item);
                                  }}
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit(item);
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    title="Hapus"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingId(item.id);
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Detail Row */}
                      <AnimatePresence>
                        {expandedId === item.id && (
                          <TableRow
                            key={`detail-${String(item.id)}`}
                            className="hover:bg-transparent"
                          >
                            <TableCell colSpan={8} className="p-0">
                              <RowDetail item={item} />
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </>
                  ))}
            </TableBody>
          </Table>

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-sm">
                Tidak ada data penerima bantuan
              </p>
              <p className="text-xs mt-1">
                {activeFilter !== "semua"
                  ? `Tidak ada data dengan status "${filterLabels[activeFilter]}"`
                  : search
                    ? "Tidak ada data yang cocok dengan pencarian"
                    : "Belum ada data yang diinput"}
              </p>
              {isAdminOrValidator && !search && (
                <Button
                  onClick={openAdd}
                  className="mt-4 bg-primary text-white gap-2"
                  size="sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Data Pertama
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer note */}
        {!isAdminOrValidator && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Login sebagai admin atau validator untuk mengelola data
          </p>
        )}
        {isAdminOrValidator && (
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Link2 className="w-3 h-3 text-emerald-500" />
            Ikon hijau menandakan NIK terdaftar di Validasi Data Bencana
          </p>
        )}
      </div>

      {/* Form Dialog */}
      <BantuanFormDialog
        editing={editingItem}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setPrefillVictim(null);
        }}
        isAdminOrValidator={!!isAdminOrValidator}
        prefillVictim={prefillVictim}
        victims={allVictims}
      />

      {/* Status Update Dialog */}
      <StatusUpdateDialog
        item={statusItem}
        open={!!statusItem}
        onClose={() => setStatusItem(null)}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Penerima Bantuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data penerima bantuan akan
              dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBantuan.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
