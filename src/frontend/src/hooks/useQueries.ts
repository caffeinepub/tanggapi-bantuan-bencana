import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AidRecipient,
  DisasterVictim,
  FooterLink,
  Publication,
  Report,
  UserEntry,
  ValidationRecord,
  ValidationStats,
} from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

export { UserRole };

// ─── Aid Recipients ───────────────────────────────────────────────────────────

export function useGetAllAidRecipients() {
  const { actor, isFetching } = useActor();
  return useQuery<AidRecipient[]>({
    queryKey: ["aidRecipients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAidRecipients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalRecipients() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalRecipients"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalRecipients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecipientsByDistrict() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["recipientsByDistrict"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecipientsByDistrict();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecipientsByAidType() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["recipientsByAidType"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecipientsByAidType();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecipientsByStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["recipientsByStatus"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecipientsByStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchAidRecipients(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AidRecipient[]>({
    queryKey: ["searchAidRecipients", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchAidRecipients(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useAddAidRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aid: AidRecipient) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addAidRecipient(aid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aidRecipients"] });
      queryClient.invalidateQueries({ queryKey: ["totalRecipients"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByDistrict"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByAidType"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByStatus"] });
    },
  });
}

export function useUpdateAidRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (aid: AidRecipient) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateAidRecipient(aid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aidRecipients"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByDistrict"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByAidType"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByStatus"] });
    },
  });
}

export function useDeleteAidRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteAidRecipient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aidRecipients"] });
      queryClient.invalidateQueries({ queryKey: ["totalRecipients"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByDistrict"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByAidType"] });
      queryClient.invalidateQueries({ queryKey: ["recipientsByStatus"] });
    },
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export function useGetAllReports() {
  const { actor, isFetching } = useActor();
  return useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReportsByStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["reportsByStatus"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReportsByStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetReportsByTopic() {
  const { actor, isFetching } = useActor();
  return useQuery<[string, bigint][]>({
    queryKey: ["reportsByTopic"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReportsByTopic();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: Report) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportsByStatus"] });
      queryClient.invalidateQueries({ queryKey: ["reportsByTopic"] });
    },
  });
}

export function useUpdateReportStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateReportStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reportsByStatus"] });
    },
  });
}

// ─── Publications ─────────────────────────────────────────────────────────────

export function useGetAllPublications() {
  const { actor, isFetching } = useActor();
  return useQuery<Publication[]>({
    queryKey: ["publications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPublication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publication: Publication) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addPublication(publication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useUpdatePublication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publication: Publication) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePublication(publication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useDeletePublication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deletePublication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return UserRole.guest;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<{ name: string } | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInitializeSampleData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.initializeSampleData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// ─── User Management ──────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserEntry[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
    },
  });
}

// ─── Footer Links ─────────────────────────────────────────────────────────────

export function useGetFooterLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<FooterLink[]>({
    queryKey: ["footerLinks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFooterLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddFooterLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: FooterLink) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addFooterLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footerLinks"] });
    },
  });
}

export function useUpdateFooterLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (link: FooterLink) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateFooterLink(link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footerLinks"] });
    },
  });
}

export function useDeleteFooterLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteFooterLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["footerLinks"] });
    },
  });
}

// ─── Disaster Victims ─────────────────────────────────────────────────────────

export function useGetAllDisasterVictims() {
  const { actor, isFetching } = useActor();
  return useQuery<DisasterVictim[]>({
    queryKey: ["disasterVictims"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDisasterVictims();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDisasterVictim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (victim: DisasterVictim) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addDisasterVictim(victim);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasterVictims"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
    },
  });
}

export function useUpdateDisasterVictim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (victim: DisasterVictim) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateDisasterVictim(victim);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasterVictims"] });
    },
  });
}

export function useDeleteDisasterVictim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteDisasterVictim(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disasterVictims"] });
      queryClient.invalidateQueries({ queryKey: ["validationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
    },
  });
}

// ─── Validator Auth ───────────────────────────────────────────────────────────

export function useIsCallerValidator() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerValidator"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerValidator();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useIsCallerAdminOrValidator() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdminOrValidator"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdminOrValidator();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

// ─── Validation Records ───────────────────────────────────────────────────────

export function useGetAllValidationRecords(isAdminOrValidator?: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<ValidationRecord[]>({
    queryKey: ["validationRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllValidationRecords();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && (isAdminOrValidator ?? true),
    retry: 0,
  });
}

export function useGetValidationRecordsByVictim(victimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ValidationRecord[]>({
    queryKey: ["validationRecordsByVictim", victimId?.toString()],
    queryFn: async () => {
      if (!actor || victimId === null) return [];
      try {
        return await actor.getValidationRecordsByVictim(victimId);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && victimId !== null,
    retry: 0,
  });
}

export function useAddValidationRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: ValidationRecord) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addValidationRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validationRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["validationRecordsByVictim"],
      });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
    },
  });
}

export function useUpdateValidationRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: ValidationRecord) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateValidationRecord(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validationRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["validationRecordsByVictim"],
      });
    },
  });
}

export function useUpdateValidationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      validatedBy,
    }: {
      id: bigint;
      status: string;
      notes: string;
      validatedBy: Principal;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateValidationStatus(id, status, notes, validatedBy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validationRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["validationRecordsByVictim"],
      });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
    },
  });
}

export function useDeleteValidationRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteValidationRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["validationRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["validationRecordsByVictim"],
      });
      queryClient.invalidateQueries({ queryKey: ["validationStats"] });
    },
  });
}

export function useGetValidationStats() {
  const { actor, isFetching } = useActor();
  return useQuery<ValidationStats>({
    queryKey: ["validationStats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalVictims: BigInt(0),
          byDisasterType: [],
          byValidationStatus: [],
        };
      return actor.getValidationStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Validator Management (Admin Only) ────────────────────────────────────────

export function useGetAllValidators() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["allValidators"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllValidators();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 0,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useAssignValidatorRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.assignValidatorRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allValidators"] });
      queryClient.invalidateQueries({ queryKey: ["isCallerValidator"] });
    },
  });
}

export function useRevokeValidatorRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.revokeValidatorRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allValidators"] });
    },
  });
}

// ─── Bantuan Penerima ─────────────────────────────────────────────────────────

import type { BantuanPenerima } from "../backend.d";

export function useGetAllBantuanPenerima() {
  const { actor, isFetching } = useActor();
  return useQuery<BantuanPenerima[]>({
    queryKey: ["bantuanPenerima"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBantuanPenerima();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterBantuanPenerimaByStatus(status: string) {
  const { actor, isFetching } = useActor();
  return useQuery<BantuanPenerima[]>({
    queryKey: ["bantuanPenerimaByStatus", status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterBantuanPenerimaByStatus(status);
    },
    enabled: !!actor && !isFetching && status !== "semua",
  });
}

export function useAddBantuanPenerima() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BantuanPenerima) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addBantuanPenerima(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerima"] });
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerimaByStatus"] });
    },
  });
}

export function useUpdateBantuanPenerima() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: BantuanPenerima) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateBantuanPenerima(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerima"] });
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerimaByStatus"] });
    },
  });
}

export function useUpdateBantuanPenerimaStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      validasiStatus,
      tindakLanjutKeterangan,
      instansiPembantu,
    }: {
      id: bigint;
      validasiStatus: string;
      tindakLanjutKeterangan: string;
      instansiPembantu: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateBantuanPenerimaStatus(
        id,
        validasiStatus,
        tindakLanjutKeterangan,
        instansiPembantu,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerima"] });
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerimaByStatus"] });
    },
  });
}

export function useDeleteBantuanPenerima() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteBantuanPenerima(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerima"] });
      queryClient.invalidateQueries({ queryKey: ["bantuanPenerimaByStatus"] });
    },
  });
}
