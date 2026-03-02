import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
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

  public type UserProfile = {
    name : Text;
  };

  // State
  let accessControlState = AccessControl.initState();

  let aidRecipients = Map.empty<Nat, AidRecipient>();
  let reports = Map.empty<Nat, Report>();
  let publications = Map.empty<Nat, Publication>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextAidId = 1;
  var nextReportId = 1;
  var nextPublicationId = 1;

  // Mixins
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Sample Data Initialization
  public shared ({ caller }) func initializeSampleData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can initialize sample data");
    };

    if (aidRecipients.isEmpty()) {
      let sampleAids = [
        {
          id = nextAidId;
          name = "Ahmad Zulfikar";
          nik = "1101010101010001";
          address = "Jl. Merdeka No. 10";
          district = "Banda Aceh";
          subdistrict = "Kuta Alam";
          aidType = "logistik";
          aidAmount = 500000;
          distributionStatus = "menunggu";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 1;
          name = "Siti Aisyah";
          nik = "1101010101010002";
          address = "Jl. Iskandar Muda No. 12";
          district = "Banda Aceh";
          subdistrict = "Meuraxa";
          aidType = "hunian-sementara";
          aidAmount = 1000000;
          distributionStatus = "diproses";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 2;
          name = "Muhammad Rizki";
          nik = "1101010101010003";
          address = "Gampong Lamteh";
          district = "Aceh Besar";
          subdistrict = "Lhoknga";
          aidType = "kesehatan";
          aidAmount = 300000;
          distributionStatus = "didistribusikan";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 3;
          name = "Fitriani";
          nik = "1101010101010004";
          address = "Jl. Teuku Umar";
          district = "Aceh Timur";
          subdistrict = "Peureulak";
          aidType = "pendidikan";
          aidAmount = 200000;
          distributionStatus = "menunggu";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 4;
          name = "Ismail";
          nik = "1101010101010005";
          address = "Jl. Diponegoro";
          district = "Banda Aceh";
          subdistrict = "Baiturrahman";
          aidType = "logistik";
          aidAmount = 700000;
          distributionStatus = "diproses";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 5;
          name = "Nurul Jannah";
          nik = "1101010101010006";
          address = "Gampong Keude";
          district = "Aceh Besar";
          subdistrict = "Indrapuri";
          aidType = "hunian-tetap";
          aidAmount = 1500000;
          distributionStatus = "menunggu";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 6;
          name = "Fadli";
          nik = "1101010101010007";
          address = "Jl. Sudirman";
          district = "Aceh Timur";
          subdistrict = "Langsa";
          aidType = "logistik";
          aidAmount = 400000;
          distributionStatus = "didistribusikan";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 7;
          name = "Rosita";
          nik = "1101010101010008";
          address = "Jl. Tgk. Chik Ditiro";
          district = "Banda Aceh";
          subdistrict = "Syiah Kuala";
          aidType = "kesehatan";
          aidAmount = 600000;
          distributionStatus = "diproses";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 8;
          name = "Hermawan";
          nik = "1101010101010009";
          address = "Gampong Cot";
          district = "Aceh Besar";
          subdistrict = "Sukamakmur";
          aidType = "pendidikan";
          aidAmount = 250000;
          distributionStatus = "menunggu";
          registrationDate = Time.now();
        },
        {
          id = nextAidId + 9;
          name = "Dewi Sartika";
          nik = "1101010101010010";
          address = "Jl. Panglima Polem";
          district = "Banda Aceh";
          subdistrict = "Ulee Kareng";
          aidType = "logistik";
          aidAmount = 550000;
          distributionStatus = "didistribusikan";
          registrationDate = Time.now();
        },
      ];

      for (aid in sampleAids.vals()) {
        aidRecipients.add(aid.id, aid);
      };
      nextAidId += 10;
    };

    if (reports.isEmpty()) {
      let sampleReports = [
        {
          id = nextReportId;
          title = "Laporan Bencana Banjir";
          description = "Terjadi banjir di kawasan Lhoknga";
          topic = "bencana";
          reporterName = "Samsul";
          reportDate = Time.now();
          status = "baru";
        },
        {
          id = nextReportId + 1;
          title = "Pengaduan Bantuan Tidak Merata";
          description = "Distribusi bantuan belum merata di Aceh Besar";
          topic = "bantuan";
          reporterName = "Rahmat";
          reportDate = Time.now();
          status = "ditindaklanjuti";
        },
        {
          id = nextReportId + 2;
          title = "Kekurangan Tenda di Pengungsian";
          description = "Tenda di Meuraxa masih kurang";
          topic = "pengungsian";
          reporterName = "Siti";
          reportDate = Time.now();
          status = "selesai";
        },
        {
          id = nextReportId + 3;
          title = "Jalan Rusak Akibat Bencana";
          description = "Jalan utama di Baiturrahman rusak";
          topic = "infrastruktur";
          reporterName = "Junaidi";
          reportDate = Time.now();
          status = "baru";
        },
        {
          id = nextReportId + 4;
          title = "Kekurangan Obat-obatan";
          description = "Obat-obatan di pengungsian Meuraxa menipis";
          topic = "kesehatan";
          reporterName = "Dian";
          reportDate = Time.now();
          status = "ditindaklanjuti";
        },
      ];

      for (report in sampleReports.vals()) {
        reports.add(report.id, report);
      };
      nextReportId += 5;
    };

    if (publications.isEmpty()) {
      let samplePublications = [
        {
          id = nextPublicationId;
          title = "Pentingnya Kesiapsiagaan Bencana";
          summary = "Tips untuk menghadapi bencana";
          content = "Isi artikel lengkap tentang kesiapsiagaan bencana...";
          author = "BNPB Aceh";
          publishDate = Time.now();
          tags = ["bencana", "kesiapsiagaan"];
          readTime = 5;
        },
        {
          id = nextPublicationId + 1;
          title = "Proses Distribusi Bantuan";
          summary = "Rincian proses distribusi bantuan di Aceh";
          content = "Isi artikel lengkap tentang distribusi bantuan...";
          author = "Dinas Sosial";
          publishDate = Time.now();
          tags = ["bantuan", "distribusi"];
          readTime = 7;
        },
        {
          id = nextPublicationId + 2;
          title = "Tips Kesehatan di Pengungsian";
          summary = "Cara menjaga kesehatan di pengungsian";
          content = "Isi artikel lengkap tentang tips kesehatan...";
          author = "Dinkes Aceh";
          publishDate = Time.now();
          tags = ["kesehatan", "pengungsian"];
          readTime = 6;
        },
      ];

      for (publication in samplePublications.vals()) {
        publications.add(publication.id, publication);
      };
      nextPublicationId += 3;
    };
  };

  // Aid Recipients Management
  public query ({ caller }) func getAllAidRecipients() : async [AidRecipient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view aid recipients");
    };
    aidRecipients.values().toArray();
  };

  public query ({ caller }) func getAidRecipientById(id : Nat) : async ?AidRecipient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view aid recipients");
    };
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

  public query ({ caller }) func filterAidRecipientsByDistrict(district : Text) : async [AidRecipient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter aid recipients");
    };
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.district == district }
    );
    filtered;
  };

  public query ({ caller }) func filterAidRecipientsByType(aidType : Text) : async [AidRecipient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter aid recipients");
    };
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.aidType == aidType }
    );
    filtered;
  };

  public query ({ caller }) func filterAidRecipientsByStatus(status : Text) : async [AidRecipient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter aid recipients");
    };
    let filtered = aidRecipients.values().toArray().filter(
      func(aid : AidRecipient) : Bool { aid.distributionStatus == status }
    );
    filtered;
  };

  public query ({ caller }) func searchAidRecipients(searchTerm : Text) : async [AidRecipient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search aid recipients");
    };
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
  public query ({ caller }) func getAllReports() : async [Report] {
    // Public access - anyone can view reports including guests
    reports.values().toArray();
  };

  public query ({ caller }) func getReportById(id : Nat) : async ?Report {
    // Public access - anyone can view reports including guests
    reports.get(id);
  };

  public shared ({ caller }) func addReport(report : Report) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reports");
    };

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

  public query ({ caller }) func filterReportsByTopic(topic : Text) : async [Report] {
    // Public access - anyone can filter reports including guests
    let filtered = reports.values().toArray().filter(
      func(report : Report) : Bool { report.topic == topic }
    );
    filtered;
  };

  public query ({ caller }) func filterReportsByStatus(status : Text) : async [Report] {
    // Public access - anyone can filter reports including guests
    let filtered = reports.values().toArray().filter(
      func(report : Report) : Bool { report.status == status }
    );
    filtered;
  };

  // Publications Management
  public query ({ caller }) func getAllPublications() : async [Publication] {
    // Public access - anyone can view publications including guests
    publications.values().toArray();
  };

  public query ({ caller }) func getPublicationById(id : Nat) : async ?Publication {
    // Public access - anyone can view publications including guests
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
  public query ({ caller }) func getTotalRecipients() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };
    aidRecipients.size();
  };

  public query ({ caller }) func getRecipientsByDistrict() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };

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

  public query ({ caller }) func getRecipientsByAidType() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };

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

  public query ({ caller }) func getRecipientsByStatus() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view statistics");
    };

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

  public query ({ caller }) func getReportsByTopic() : async [(Text, Nat)] {
    // Public access - anyone can view report statistics including guests
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

  public query ({ caller }) func getReportsByStatus() : async [(Text, Nat)] {
    // Public access - anyone can view report statistics including guests
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
};
