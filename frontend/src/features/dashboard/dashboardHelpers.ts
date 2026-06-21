export const calculateAge = (dobString: string) => {
  if (!dobString) return 28;
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return 28;
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateCompatibility = (myProfile: any, otherProfile: any) => {
  let score = 50; // Base score
  if (!myProfile || !otherProfile) return score;

  const checkMatch = (val1: any, val2: any) => {
    if (val1 && val2 && val1 === val2) score += 5;
  };

  checkMatch(myProfile.caste, otherProfile.caste);
  checkMatch(myProfile.subCaste, otherProfile.subCaste);
  checkMatch(myProfile.motherTongue, otherProfile.motherTongue);
  checkMatch(myProfile.state, otherProfile.state);
  checkMatch(myProfile.foodPreference, otherProfile.foodPreference);
  checkMatch(myProfile.smoking, otherProfile.smoking);
  checkMatch(myProfile.drinking, otherProfile.drinking);
  checkMatch(myProfile.maritalStatus, otherProfile.maritalStatus);
  checkMatch(myProfile.manglik, otherProfile.manglik);
  checkMatch(myProfile.lifestyle, otherProfile.lifestyle);

  return Math.min(Math.max(score, 45), 100);
};

export const isMarriageFixed = (name: string) => {
  if (!name) return false;
  const firstName = name.split(" ")[0].toLowerCase();
  const fixedNames = ["amit", "smita", "rajesh", "aarti", "neha", "suresh", "anjali", "manoj"];
  return fixedNames.includes(firstName);
};

export const getWeddingDate = (name: string) => {
  if (!name) return "";
  const firstName = name.split(" ")[0].toLowerCase();
  if (firstName === "amit" || firstName === "smita") return "November 12, 2025";
  if (firstName === "rajesh" || firstName === "aarti") return "January 04, 2026";
  if (firstName === "neha" || firstName === "suresh") return "February 18, 2026";
  if (firstName === "anjali" || firstName === "manoj") return "March 10, 2026";
  return "";
};

export const getSpouseName = (name: string) => {
  if (!name) return "";
  const firstName = name.split(" ")[0].toLowerCase();
  if (firstName === "amit") return "Smita";
  if (firstName === "smita") return "Amit";
  if (firstName === "rajesh") return "Aarti";
  if (firstName === "aarti") return "Rajesh";
  if (firstName === "neha") return "Suresh";
  if (firstName === "suresh") return "Neha";
  if (firstName === "anjali") return "Manoj";
  if (firstName === "manoj") return "Anjali";
  return "";
};

export type TabType =
  | "matches"
  | "search"
  | "shortlisted"
  | "interests"
  | "my-profile"
  | "horoscope"
  | "kyc"
  | "messages"
  | "stories"
  | "subscriptions"
  | "settings"
  | "help"
  | "view-profile"
  | "interests-received";
