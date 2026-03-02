import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type AidRecipient = {
    id : Nat;
    name : Text;
    nik : Text;
    address : Text;
    district : Text;
    subdistrict : Text;
    aidType : Text;
    aidAmount : Nat;
    distributionStatus : Text;
    registrationDate : Int;
  };

  type Report = {
    id : Nat;
    title : Text;
    description : Text;
    topic : Text;
    reporterName : Text;
    reportDate : Int;
    status : Text;
  };

  type Publication = {
    id : Nat;
    title : Text;
    summary : Text;
    content : Text;
    author : Text;
    publishDate : Int;
    tags : [Text];
    readTime : Nat;
  };

  type FooterLink = {
    id : Nat;
    linkLabel : Text;
    url : Text;
    order : Nat;
  };

  type DashboardStat = {
    totalRecipients : Nat;
    recipientsByDistrict : [(Text, Nat)];
    recipientsByAidType : [(Text, Nat)];
    recipientsByStatus : [(Text, Nat)];
    reportsByTopic : [(Text, Nat)];
    reportsByStatus : [(Text, Nat)];
  };

  public type UserEntry = {
    principal : Principal;
    role : Text;
  };

  // Validator Types
  public type DisasterVictim = {
    id : Nat;
    nik : Text;
    fullName : Text;
    address : Text;
    rt : Text;
    rw : Text;
    kelurahan : Text;
    kecamatan : Text;
    kabupaten : Text;
    disasterType : Text;
    disasterDate : Int;
    physicalCondition : Text;
    damageLevel : Text;
    lossDescription : Text;
    registeredBy : Principal;
    registrationDate : Int;
  };

  public type ValidationRecord = {
    id : Nat;
    victimId : Nat;
    needType : Text;
    needDescription : Text;
    estimatedValue : Nat;
    validationStatus : Text;
    validatorNotes : Text;
    validatedBy : ?Principal;
    validationDate : ?Int;
    createdBy : Principal;
    createdDate : Int;
  };

  public type ValidationStats = {
    totalVictims : Nat;
    byDisasterType : [(Text, Nat)];
    byValidationStatus : [(Text, Nat)];
  };

  // NEW TYPE: BantuanPenerima
  public type BantuanPenerima = {
    id : Nat;
    nama : Text;
    nik : Text;
    alamat : Text;
    keperluanBantuan : Text;
    keterangan : Text;
    prosesTindakLanjut : Text;
    instansiPembantu : Text;
    validasiStatus : Text;
    tindakLanjutKeterangan : Text;
    createdBy : Principal;
    createdDate : Int;
    updatedDate : Int;
  };

  // State
  let accessControlState = AccessControl.initState();

  // Persistent data structures
  let aidRecipients = Map.empty<Nat, AidRecipient>();
  let reports = Map.empty<Nat, Report>();
  let publications = Map.empty<Nat, Publication>();
  let userProfiles = Map.empty<Principal, { name : Text }>();
  let footerLinks = Map.empty<Nat, FooterLink>();
  let disasterVictims = Map.empty<Nat, DisasterVictim>();
  let validationRecords = Map.empty<Nat, ValidationRecord>();
  let validatorUsers = Map.empty<Principal, ()>();

  // NEW STATE
  let bantuanPenerimaMap = Map.empty<Nat, BantuanPenerima>();
  var nextBantuanPenerimaId = 1;

  var nextAidId = 1;
  var nextReportId = 1;
  var nextPublicationId = 1;
  var nextFooterLinkId = 1;
  var nextVictimId = 1;
  var nextValidationRecordId = 1;

  // Mixins
  include MixinAuthorization(accessControlState);

  // Footer Links Management
  public query ({ caller = _ }) func getFooterLinks() : async [FooterLink] {
    footerLinks.values().toArray().sort(
      func(a, b) { Nat.compare(a.order, b.order) }
    );
  };

  public shared ({ caller }) func addFooterLink(link : FooterLink) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add footer links");
    };

    let newLink = {
      id = nextFooterLinkId;
      linkLabel = link.linkLabel;
      url = link.url;
      order = link.order;
    };
    footerLinks.add(nextFooterLinkId, newLink);
    nextFooterLinkId += 1;
    newLink.id;
  };

  public shared ({ caller }) func updateFooterLink(link : FooterLink) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update footer links");
    };

    if (not (footerLinks.containsKey(link.id))) {
      return false;
    };

    footerLinks.add(link.id, link);
    true;
  };

  public shared ({ caller }) func deleteFooterLink(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete footer links");
    };

    if (not (footerLinks.containsKey(id))) {
      return false;
    };

    footerLinks.remove(id);
    true;
  };

  public shared ({ caller }) func initializeSampleData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize sample data");
    };

    // Initialize Footer Links if empty
    if (footerLinks.isEmpty()) {
      let sampleLinks = [
        {
          id = nextFooterLinkId;
          linkLabel = "Relawan TIK Indonesia";
          url = "https://rtik.id";
          order = 1;
        },
        {
          id = nextFooterLinkId + 1;
          linkLabel = "Badan Nasional Penanggulangan Bencana";
          url = "https://bnpb.go.id";
          order = 2;
        },
        {
          id = nextFooterLinkId + 2;
          linkLabel = "Indonesia Peduli Bencana";
          url = "https://indonesia.go.id";
          order = 3;
        },
        {
          id = nextFooterLinkId + 3;
          linkLabel = "Kementerian Sosial RI";
          url = "https://kemensos.go.id";
          order = 4;
        },
        {
          id = nextFooterLinkId + 4;
          linkLabel = "Palang Merah Indonesia";
          url = "https://pmi.or.id";
          order = 5;
        },
      ];

      for (link in sampleLinks.vals()) {
        footerLinks.add(link.id, link);
      };
      nextFooterLinkId += 5;
    };
  };

  // Aid Recipients Management
  public query ({ caller = _ }) func getAllAidRecipients() : async [AidRecipient] {
    aidRecipients.values().toArray();
  };

  public query ({ caller = _ }) func getAidRecipientById(id : Nat) : async ?AidRecipient {
    aidRecipients.get(id);
  };

  public shared ({ caller }) func addAidRecipient(aid : AidRecipient) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add aid recipients");
    };

    let newAid = {
      id = nextAidId;
      name = aid.name;
      nik = aid.nik;
      address = aid.address;
      district = aid.district;
      subdistrict = aid.subdistrict;
      aidType = aid.aidType;
      aidAmount = aid.aidAmount;
      distributionStatus = aid.distributionStatus;
      registrationDate = aid.registrationDate;
    };
    aidRecipients.add(nextAidId, newAid);
    nextAidId += 1;
    newAid.id;
  };

  public shared ({ caller }) func updateAidRecipient(aid : AidRecipient) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update aid recipients");
    };

    if (not (aidRecipients.containsKey(aid.id))) {
      return false;
    };

    aidRecipients.add(aid.id, aid);
    true;
  };

  public shared ({ caller }) func deleteAidRecipient(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete aid recipients");
    };

    if (not (aidRecipients.containsKey(id))) {
      return false;
    };

    aidRecipients.remove(id);
    true;
  };

  public query ({ caller = _ }) func filterAidRecipientsByDistrict(district : Text) : async [AidRecipient] {
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.district == district }
    );
    filtered;
  };

  public query ({ caller = _ }) func filterAidRecipientsByType(aidType : Text) : async [AidRecipient] {
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.aidType == aidType }
    );
    filtered;
  };

  public query ({ caller = _ }) func filterAidRecipientsByStatus(status : Text) : async [AidRecipient] {
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.distributionStatus == status }
    );
    filtered;
  };

  public query ({ caller = _ }) func searchAidRecipients(searchTerm : Text) : async [AidRecipient] {
    let lowerSearchTerm = searchTerm.toLower();
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool {
        aid.name.toLower().contains(#text lowerSearchTerm) or
        aid.nik.toLower().contains(#text lowerSearchTerm)
      }
    );
    filtered;
  };

  // Reports Management
  public query ({ caller = _ }) func getAllReports() : async [Report] {
    reports.values().toArray();
  };

  public query ({ caller = _ }) func getReportById(id : Nat) : async ?Report {
    reports.get(id);
  };

  public shared ({ caller = _ }) func addReport(report : Report) : async Nat {
    // Public can add reports
    let newReport = {
      id = nextReportId;
      title = report.title;
      description = report.description;
      topic = report.topic;
      reporterName = report.reporterName;
      reportDate = report.reportDate;
      status = report.status;
    };
    reports.add(nextReportId, newReport);
    nextReportId += 1;
    newReport.id;
  };

  public shared ({ caller }) func updateReportStatus(id : Nat, status : Text) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update report status");
    };

    if (not (reports.containsKey(id))) {
      return false;
    };

    switch (reports.get(id)) {
      case (null) { false };
      case (?report) {
        let updatedReport = {
          id = report.id;
          title = report.title;
          description = report.description;
          topic = report.topic;
          reporterName = report.reporterName;
          reportDate = report.reportDate;
          status;
        };
        reports.add(id, updatedReport);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteReport(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete reports");
    };

    if (not (reports.containsKey(id))) {
      return false;
    };

    reports.remove(id);
    true;
  };

  public query ({ caller = _ }) func filterReportsByTopic(topic : Text) : async [Report] {
    let filtered = reports.values().toArray().filter(
      func(report : Report) : Bool { report.topic == topic }
    );
    filtered;
  };

  public query ({ caller = _ }) func filterReportsByStatus(status : Text) : async [Report] {
    let filtered = reports.values().toArray().filter(
      func(report : Report) : Bool { report.status == status }
    );
    filtered;
  };

  // Publications Management
  public query ({ caller = _ }) func getAllPublications() : async [Publication] {
    publications.values().toArray();
  };

  public query ({ caller = _ }) func getPublicationById(id : Nat) : async ?Publication {
    publications.get(id);
  };

  public shared ({ caller }) func addPublication(publication : Publication) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add publications");
    };

    let newPublication = {
      id = nextPublicationId;
      title = publication.title;
      summary = publication.summary;
      content = publication.content;
      author = publication.author;
      publishDate = publication.publishDate;
      tags = publication.tags;
      readTime = publication.readTime;
    };
    publications.add(nextPublicationId, newPublication);
    nextPublicationId += 1;
    newPublication.id;
  };

  public shared ({ caller }) func updatePublication(publication : Publication) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update publications");
    };

    if (not (publications.containsKey(publication.id))) {
      return false;
    };

    publications.add(publication.id, publication);
    true;
  };

  public shared ({ caller }) func deletePublication(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete publications");
    };

    if (not (publications.containsKey(id))) {
      return false;
    };

    publications.remove(id);
    true;
  };

  // Dashboard Statistics
  public query ({ caller = _ }) func getTotalRecipients() : async Nat {
    aidRecipients.size();
  };

  public query ({ caller = _ }) func getRecipientsByDistrict() : async [(Text, Nat)] {
    let districtMap = Map.empty<Text, Nat>();

    for (aid in aidRecipients.values()) {
      switch (districtMap.get(aid.district)) {
        case (null) {
          districtMap.add(aid.district, 1);
        };
        case (?count) {
          districtMap.add(aid.district, count + 1);
        };
      };
    };

    districtMap.toArray();
  };

  public query ({ caller = _ }) func getRecipientsByAidType() : async [(Text, Nat)] {
    let typeMap = Map.empty<Text, Nat>();

    for (aid in aidRecipients.values()) {
      switch (typeMap.get(aid.aidType)) {
        case (null) {
          typeMap.add(aid.aidType, 1);
        };
        case (?count) {
          typeMap.add(aid.aidType, count + 1);
        };
      };
    };

    typeMap.toArray();
  };

  public query ({ caller = _ }) func getRecipientsByStatus() : async [(Text, Nat)] {
    let statusMap = Map.empty<Text, Nat>();

    for (aid in aidRecipients.values()) {
      switch (statusMap.get(aid.distributionStatus)) {
        case (null) {
          statusMap.add(aid.distributionStatus, 1);
        };
        case (?count) {
          statusMap.add(aid.distributionStatus, count + 1);
        };
      };
    };

    statusMap.toArray();
  };

  public query ({ caller = _ }) func getReportsByTopic() : async [(Text, Nat)] {
    let topicMap = Map.empty<Text, Nat>();

    for (report in reports.values()) {
      switch (topicMap.get(report.topic)) {
        case (null) {
          topicMap.add(report.topic, 1);
        };
        case (?count) {
          topicMap.add(report.topic, count + 1);
        };
      };
    };

    topicMap.toArray();
  };

  public query ({ caller = _ }) func getReportsByStatus() : async [(Text, Nat)] {
    let statusMap = Map.empty<Text, Nat>();

    for (report in reports.values()) {
      switch (statusMap.get(report.status)) {
        case (null) {
          statusMap.add(report.status, 1);
        };
        case (?count) {
          statusMap.add(report.status, count + 1);
        };
      };
    };

    statusMap.toArray();
  };

  // User Management
  public query ({ caller }) func getCallerUserProfile() : async ?{ name : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?{ name : Text } {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : { name : Text }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get All Users
  func roleToText(role : AccessControl.UserRole) : Text {
    switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
  };

  public query ({ caller }) func getAllUsers() : async [UserEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all users");
    };

    let entries = accessControlState.userRoles.toArray();
    let userEntries = entries.map(
      func((principal, role) : (Principal, AccessControl.UserRole)) : UserEntry {
        {
          principal;
          role = roleToText(role);
        };
      }
    );
    userEntries;
  };

  // VALIDATION (ADMIN + VALIDATOR ROLE)
  public type ValidatorRole = { #none; #validator; #admin };

  // INTERNAL only, distinguishes admin/validator
  func getValidatorRole(caller : Principal) : ValidatorRole {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      #admin;
    } else if (validatorUsers.containsKey(caller)) {
      #validator;
    } else {
      #none;
    };
  };

  // Check if caller is admin or validator
  func isAdminOrValidator(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or validatorUsers.containsKey(caller);
  };

  // PUBLIC check for frontend, only distinguishes validator/non-validator
  public query ({ caller }) func isCallerValidator() : async Bool {
    validatorUsers.containsKey(caller);
  };

  // Returns true if caller is admin or validator
  public query ({ caller }) func isCallerAdminOrValidator() : async Bool {
    isAdminOrValidator(caller);
  };

  // DisasterVictim CRUD
  public query ({ caller = _ }) func getAllDisasterVictims() : async [DisasterVictim] {
    // Public query
    disasterVictims.values().toArray();
  };

  public query ({ caller = _ }) func getDisasterVictimById(id : Nat) : async ?DisasterVictim {
    // Public query
    disasterVictims.get(id);
  };

  public shared ({ caller }) func addDisasterVictim(victim : DisasterVictim) : async Nat {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can add disaster victims");
    };

    let newVictim : DisasterVictim = {
      id = nextVictimId;
      nik = victim.nik;
      fullName = victim.fullName;
      address = victim.address;
      rt = victim.rt;
      rw = victim.rw;
      kelurahan = victim.kelurahan;
      kecamatan = victim.kecamatan;
      kabupaten = victim.kabupaten;
      disasterType = victim.disasterType;
      disasterDate = victim.disasterDate;
      physicalCondition = victim.physicalCondition;
      damageLevel = victim.damageLevel;
      lossDescription = victim.lossDescription;
      registeredBy = caller;
      registrationDate = Time.now();
    };

    disasterVictims.add(nextVictimId, newVictim);
    nextVictimId += 1;
    newVictim.id;
  };

  public shared ({ caller }) func updateDisasterVictim(victim : DisasterVictim) : async Bool {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can update disaster victims");
    };

    if (not (disasterVictims.containsKey(victim.id))) {
      return false;
    };

    disasterVictims.add(victim.id, victim);
    true;
  };

  public shared ({ caller }) func deleteDisasterVictim(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete disaster victims");
    };

    switch (disasterVictims.get(id)) {
      case (null) {
        Runtime.trap("Error: Victim not found");
      };
      case (?_) {};
    };

    disasterVictims.remove(id);
  };

  // ValidationRecord CRUD
  public query ({ caller }) func getAllValidationRecords() : async [ValidationRecord] {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can view validation records");
    };
    validationRecords.values().toArray();
  };

  public query ({ caller }) func getValidationRecordsByVictim(victimId : Nat) : async [ValidationRecord] {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can view validation records");
    };

    let filtered = validationRecords.values().toArray().filter(
      func(record : ValidationRecord) : Bool { record.victimId == victimId }
    );
    filtered;
  };

  public shared ({ caller }) func addValidationRecord(record : ValidationRecord) : async Nat {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can add validation records");
    };

    let newRecord : ValidationRecord = {
      id = nextValidationRecordId;
      victimId = record.victimId;
      needType = record.needType;
      needDescription = record.needDescription;
      estimatedValue = record.estimatedValue;
      validationStatus = "menunggu";
      validatorNotes = "";
      validatedBy = null;
      validationDate = null;
      createdBy = caller;
      createdDate = Time.now();
    };

    validationRecords.add(nextValidationRecordId, newRecord);
    nextValidationRecordId += 1;
    newRecord.id;
  };

  public shared ({ caller }) func updateValidationRecord(record : ValidationRecord) : async Bool {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can update validation records");
    };

    if (not (validationRecords.containsKey(record.id))) {
      return false;
    };

    validationRecords.add(record.id, record);
    true;
  };

  public shared ({ caller }) func updateValidationStatus(
    id : Nat,
    status : Text,
    notes : Text,
    validatedBy : Principal,
  ) : async Bool {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized: Only admins/validators can update validation status");
    };

    switch (validationRecords.get(id)) {
      case (null) { false };
      case (?record) {
        let updatedRecord = {
          id = record.id;
          victimId = record.victimId;
          needType = record.needType;
          needDescription = record.needDescription;
          estimatedValue = record.estimatedValue;
          validationStatus = status;
          validatorNotes = notes;
          validatedBy = ?validatedBy;
          validationDate = ?Time.now();
          createdBy = record.createdBy;
          createdDate = record.createdDate;
        };
        validationRecords.add(id, updatedRecord);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteValidationRecord(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete validation records");
    };

    switch (validationRecords.get(id)) {
      case (null) {
        Runtime.trap("Error: Validation record not found");
      };
      case (?_) {};
    };

    validationRecords.remove(id);
  };

  // Validation Statistics
  public query ({ caller = _ }) func getValidationStats() : async ValidationStats {
    // Public query
    let totalVictims = disasterVictims.size();

    let disasterTypeMap = Map.empty<Text, Nat>();
    for (victim in disasterVictims.values()) {
      switch (disasterTypeMap.get(victim.disasterType)) {
        case (null) {
          disasterTypeMap.add(victim.disasterType, 1);
        };
        case (?count) {
          disasterTypeMap.add(victim.disasterType, count + 1);
        };
      };
    };

    let validationStatusMap = Map.empty<Text, Nat>();
    for (record in validationRecords.values()) {
      switch (validationStatusMap.get(record.validationStatus)) {
        case (null) {
          validationStatusMap.add(record.validationStatus, 1);
        };
        case (?count) {
          validationStatusMap.add(record.validationStatus, count + 1);
        };
      };
    };

    {
      totalVictims;
      byDisasterType = disasterTypeMap.toArray();
      byValidationStatus = validationStatusMap.toArray();
    };
  };

  // Validator role management
  public shared ({ caller }) func assignValidatorRole(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign validator role");
    };

    validatorUsers.add(user, ());
  };

  public shared ({ caller }) func revokeValidatorRole(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can revoke validator role");
    };

    validatorUsers.remove(user);
  };

  public query ({ caller }) func getAllValidators() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all validators");
    };

    validatorUsers.keys().toArray();
  };

  // Bantuan Penerima CRUD Operations

  public query ({ caller = _ }) func getAllBantuanPenerima() : async [BantuanPenerima] {
    // Public, no auth required
    bantuanPenerimaMap.values().toArray();
  };

  public query ({ caller = _ }) func getBantuanPenerimaById(id : Nat) : async ?BantuanPenerima {
    // Public, no auth required
    bantuanPenerimaMap.get(id);
  };

  public query ({ caller = _ }) func filterBantuanPenerimaByStatus(status : Text) : async [BantuanPenerima] {
    // Public, no auth required
    let filtered = bantuanPenerimaMap.values().toArray().filter(
      func(data : BantuanPenerima) : Bool { data.validasiStatus == status }
    );
    filtered;
  };

  // MODIFIED: No authorization check, callable by anyone including anonymous
  // Uses data.validasiStatus and data.createdBy from input
  public shared func addBantuanPenerima(data : BantuanPenerima) : async () {
    let newData : BantuanPenerima = {
      id = nextBantuanPenerimaId;
      nama = data.nama;
      nik = data.nik;
      alamat = data.alamat;
      keperluanBantuan = data.keperluanBantuan;
      keterangan = data.keterangan;
      prosesTindakLanjut = data.prosesTindakLanjut;
      instansiPembantu = data.instansiPembantu;
      validasiStatus = data.validasiStatus;
      tindakLanjutKeterangan = data.tindakLanjutKeterangan;
      createdBy = data.createdBy;
      createdDate = Time.now();
      updatedDate = Time.now();
    };

    bantuanPenerimaMap.add(nextBantuanPenerimaId, newData);
    nextBantuanPenerimaId += 1;
  };

  // MODIFIED: No authorization check, callable by anyone
  public shared func updateBantuanPenerima(data : BantuanPenerima) : async () {
    switch (bantuanPenerimaMap.get(data.id)) {
      case (null) {
        Runtime.trap("Error: Bantuan Penerima not found.");
      };
      case (?_) {
        let updatedData : BantuanPenerima = {
          data with updatedDate = Time.now();
        };
        bantuanPenerimaMap.add(data.id, updatedData);
      };
    };
  };

  public shared ({ caller }) func updateBantuanPenerimaStatus(
    id : Nat,
    validasiStatus : Text,
    tindakLanjutKeterangan : Text,
    instansiPembantu : Text,
  ) : async () {
    if (not isAdminOrValidator(caller)) {
      Runtime.trap("Unauthorized access. You must be an admin or validator to perform this action.");
    };

    switch (bantuanPenerimaMap.get(id)) {
      case (null) {
        Runtime.trap("Error: Bantuan Penerima not found.");
      };
      case (?existingData) {
        let updatedData : BantuanPenerima = {
          existingData with validasiStatus;
          tindakLanjutKeterangan;
          instansiPembantu;
          updatedDate = Time.now();
        };
        bantuanPenerimaMap.add(id, updatedData);
      };
    };
  };

  public shared ({ caller }) func deleteBantuanPenerima(id : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete Bantuan Penerima");
    };

    if (not (bantuanPenerimaMap.containsKey(id))) {
      return false;
    };

    bantuanPenerimaMap.remove(id);
    true;
  };
};
