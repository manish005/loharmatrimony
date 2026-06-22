export const calculateAge = (dobString: string) => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return null;
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
