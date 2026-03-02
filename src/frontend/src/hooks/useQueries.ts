import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AidRecipient,
  FooterLink,
  Publication,
  Report,
  UserProfile,
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
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
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
