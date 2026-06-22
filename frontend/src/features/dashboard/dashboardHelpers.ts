export const encodeId = (id: string): string =>
  btoa(id).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export const decodeId = (encoded: string): string => {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return decoded;
  } catch {
    return encoded;
  }
};

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

export const formatLastSeen = (lastActive: any): string | null => {
  if (!lastActive) return null;
  const date = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
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
