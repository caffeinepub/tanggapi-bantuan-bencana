import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserEntry {
    principal: Principal;
    role: string;
}
export interface ValidationStats {
    byValidationStatus: Array<[string, bigint]>;
    totalVictims: bigint;
    byDisasterType: Array<[string, bigint]>;
}
export interface DisasterVictim {
    id: bigint;
    rt: string;
    rw: string;
    nik: string;
    kabupaten: string;
    fullName: string;
    lossDescription: string;
    disasterDate: bigint;
    kecamatan: string;
    address: string;
    disasterType: string;
    physicalCondition: string;
    registrationDate: bigint;
    damageLevel: string;
    registeredBy: Principal;
    kelurahan: string;
}
export interface ValidationRecord {
    id: bigint;
    validationStatus: string;
    victimId: bigint;
    needType: string;
    needDescription: string;
    createdBy: Principal;
    createdDate: bigint;
    validatorNotes: string;
    estimatedValue: bigint;
    validationDate?: bigint;
    validatedBy?: Principal;
}
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
export interface BantuanPenerima {
    id: bigint;
    nik: string;
    updatedDate: bigint;
    tindakLanjutKeterangan: string;
    alamat: string;
    nama: string;
    createdBy: Principal;
    createdDate: bigint;
    instansiPembantu: string;
    keterangan: string;
    validasiStatus: string;
    prosesTindakLanjut: string;
    keperluanBantuan: string;
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
export interface FooterLink {
    id: bigint;
    url: string;
    linkLabel: string;
    order: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAidRecipient(aid: AidRecipient): Promise<bigint>;
    addBantuanPenerima(data: BantuanPenerima): Promise<void>;
    addDisasterVictim(victim: DisasterVictim): Promise<bigint>;
    addFooterLink(link: FooterLink): Promise<bigint>;
    addPublication(publication: Publication): Promise<bigint>;
    addReport(report: Report): Promise<bigint>;
    addValidationRecord(record: ValidationRecord): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignValidatorRole(user: Principal): Promise<void>;
    deleteAidRecipient(id: bigint): Promise<boolean>;
    deleteBantuanPenerima(id: bigint): Promise<boolean>;
    deleteDisasterVictim(id: bigint): Promise<void>;
    deleteFooterLink(id: bigint): Promise<boolean>;
    deletePublication(id: bigint): Promise<boolean>;
    deleteReport(id: bigint): Promise<boolean>;
    deleteValidationRecord(id: bigint): Promise<void>;
    filterAidRecipientsByDistrict(district: string): Promise<Array<AidRecipient>>;
    filterAidRecipientsByStatus(status: string): Promise<Array<AidRecipient>>;
    filterAidRecipientsByType(aidType: string): Promise<Array<AidRecipient>>;
    filterBantuanPenerimaByStatus(status: string): Promise<Array<BantuanPenerima>>;
    filterReportsByStatus(status: string): Promise<Array<Report>>;
    filterReportsByTopic(topic: string): Promise<Array<Report>>;
    getAidRecipientById(id: bigint): Promise<AidRecipient | null>;
    getAllAidRecipients(): Promise<Array<AidRecipient>>;
    getAllBantuanPenerima(): Promise<Array<BantuanPenerima>>;
    getAllDisasterVictims(): Promise<Array<DisasterVictim>>;
    getAllPublications(): Promise<Array<Publication>>;
    getAllReports(): Promise<Array<Report>>;
    getAllUsers(): Promise<Array<UserEntry>>;
    getAllValidationRecords(): Promise<Array<ValidationRecord>>;
    getAllValidators(): Promise<Array<Principal>>;
    getBantuanPenerimaById(id: bigint): Promise<BantuanPenerima | null>;
    getCallerUserProfile(): Promise<{
        name: string;
    } | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDisasterVictimById(id: bigint): Promise<DisasterVictim | null>;
    getFooterLinks(): Promise<Array<FooterLink>>;
    getPublicationById(id: bigint): Promise<Publication | null>;
    getRecipientsByAidType(): Promise<Array<[string, bigint]>>;
    getRecipientsByDistrict(): Promise<Array<[string, bigint]>>;
    getRecipientsByStatus(): Promise<Array<[string, bigint]>>;
    getReportById(id: bigint): Promise<Report | null>;
    getReportsByStatus(): Promise<Array<[string, bigint]>>;
    getReportsByTopic(): Promise<Array<[string, bigint]>>;
    getTotalRecipients(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<{
        name: string;
    } | null>;
    getValidationRecordsByVictim(victimId: bigint): Promise<Array<ValidationRecord>>;
    getValidationStats(): Promise<ValidationStats>;
    initializeSampleData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isCallerAdminOrValidator(): Promise<boolean>;
    isCallerValidator(): Promise<boolean>;
    revokeValidatorRole(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: {
        name: string;
    }): Promise<void>;
    searchAidRecipients(searchTerm: string): Promise<Array<AidRecipient>>;
    updateAidRecipient(aid: AidRecipient): Promise<boolean>;
    updateBantuanPenerima(data: BantuanPenerima): Promise<void>;
    updateBantuanPenerimaStatus(id: bigint, validasiStatus: string, tindakLanjutKeterangan: string, instansiPembantu: string): Promise<void>;
    updateDisasterVictim(victim: DisasterVictim): Promise<boolean>;
    updateFooterLink(link: FooterLink): Promise<boolean>;
    updatePublication(publication: Publication): Promise<boolean>;
    updateReportStatus(id: bigint, status: string): Promise<boolean>;
    updateValidationRecord(record: ValidationRecord): Promise<boolean>;
    updateValidationStatus(id: bigint, status: string, notes: string, validatedBy: Principal): Promise<boolean>;
}
