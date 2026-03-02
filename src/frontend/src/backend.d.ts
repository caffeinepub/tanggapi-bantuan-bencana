import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AidRecipient {
    id: bigint;
    nik: string;
    name: string;
    district: string;
    aidType: string;
    address: string;
    aidAmount: bigint;
    registrationDate: bigint;
    distributionStatus: string;
    subdistrict: string;
}
export interface Publication {
    id: bigint;
    title: string;
    content: string;
    publishDate: bigint;
    tags: Array<string>;
    author: string;
    readTime: bigint;
    summary: string;
}
export interface Report {
    id: bigint;
    status: string;
    title: string;
    topic: string;
    reporterName: string;
    description: string;
    reportDate: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAidRecipient(aid: AidRecipient): Promise<bigint>;
    addPublication(publication: Publication): Promise<bigint>;
    addReport(report: Report): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAidRecipient(id: bigint): Promise<boolean>;
    deletePublication(id: bigint): Promise<boolean>;
    filterAidRecipientsByDistrict(district: string): Promise<Array<AidRecipient>>;
    filterAidRecipientsByStatus(status: string): Promise<Array<AidRecipient>>;
    filterAidRecipientsByType(aidType: string): Promise<Array<AidRecipient>>;
    filterReportsByStatus(status: string): Promise<Array<Report>>;
    filterReportsByTopic(topic: string): Promise<Array<Report>>;
    getAidRecipientById(id: bigint): Promise<AidRecipient | null>;
    getAllAidRecipients(): Promise<Array<AidRecipient>>;
    getAllPublications(): Promise<Array<Publication>>;
    getAllReports(): Promise<Array<Report>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPublicationById(id: bigint): Promise<Publication | null>;
    getRecipientsByAidType(): Promise<Array<[string, bigint]>>;
    getRecipientsByDistrict(): Promise<Array<[string, bigint]>>;
    getRecipientsByStatus(): Promise<Array<[string, bigint]>>;
    getReportById(id: bigint): Promise<Report | null>;
    getReportsByStatus(): Promise<Array<[string, bigint]>>;
    getReportsByTopic(): Promise<Array<[string, bigint]>>;
    getTotalRecipients(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchAidRecipients(searchTerm: string): Promise<Array<AidRecipient>>;
    updateAidRecipient(aid: AidRecipient): Promise<boolean>;
    updatePublication(publication: Publication): Promise<boolean>;
    updateReportStatus(id: bigint, status: string): Promise<boolean>;
}
