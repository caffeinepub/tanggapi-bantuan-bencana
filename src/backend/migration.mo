import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldAidRecipient = {
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

  type OldReport = {
    id : Nat;
    title : Text;
    description : Text;
    topic : Text;
    reporterName : Text;
    reportDate : Int;
    status : Text;
  };

  type OldPublication = {
    id : Nat;
    title : Text;
    summary : Text;
    content : Text;
    author : Text;
    publishDate : Int;
    tags : [Text];
    readTime : Nat;
  };

  type OldUserProfile = {
    name : Text;
  };

  type OldActor = {
    aidRecipients : Map.Map<Nat, OldAidRecipient>;
    reports : Map.Map<Nat, OldReport>;
    publications : Map.Map<Nat, OldPublication>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextAidId : Nat;
    nextReportId : Nat;
    nextPublicationId : Nat;
  };

  type NewActor = {
    aidRecipients : Map.Map<Nat, OldAidRecipient>;
    reports : Map.Map<Nat, OldReport>;
    publications : Map.Map<Nat, OldPublication>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    footerLinks : Map.Map<Nat, { id : Nat; linkLabel : Text; url : Text; order : Nat }>;
    nextAidId : Nat;
    nextReportId : Nat;
    nextPublicationId : Nat;
    nextFooterLinkId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let emptyFooterLinks = Map.empty<Nat, { id : Nat; linkLabel : Text; url : Text; order : Nat }>();
    { old with footerLinks = emptyFooterLinks; nextFooterLinkId = 1 };
  };
};

