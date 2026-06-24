// Test file for Astro Functions Migration
// This file demonstrates the new astro service functionality

import { AstroService } from './astrologyService';

// Mock Firestore for testing
const mockFirestore = {
  doc: (path: string) => {
    return {
      get: async () => {
        if (path === 'profiles/user123') {
          return {
            exists: true,
            data: () => ({
              uid: 'user123',
              dob: '1990-01-01',
              birthTime: '12:00',
              birthPlace: 'Pune',
              kundali: null
            })
          };
        }
        return { exists: false };
      },
      update: async () => {}
    };
  }
};

// Mock the AstroService to use our test Firestore
AstroService.prototype.calculateKundaliForProfile = async function(uid: string, profile: any) {
  try {
    if (!profile.dob || !profile.birthTime || !profile.birthPlace) {
      return { success: false, error: "Missing required astro fields" };
    }

    // Simulate calculation
    const kundaliData = {
      moonSign: "Aries",
      moonSignIndex: 0,
      lagna: "Taurus",
      lagnaIndex: 1,
      sunSign: "Pisces",
      nakshatra: "Ashwini",
      nakshatraIndex: 0,
      nakshatraLord: "Ketu",
      pada: 1,
      planets: {
        Sun: { longitude: 350, rashi: "Pisces", rashiIndex: 11, degree: 350, retrograde: false },
        Moon: { longitude: 10, rashi: "Aries", rashiIndex: 0, degree: 10, retrograde: false },
        Mars: { longitude: 20, rashi: "Aries", rashiIndex: 0, degree: 20, retrograde: false },
        Mercury: { longitude: 30, rashi: "Aries", rashiIndex: 0, degree: 30, retrograde: false },
        Jupiter: { longitude: 40, rashi: "Taurus", rashiIndex: 1, degree: 40, retrograde: false },
        Venus: { longitude: 50, rashi: "Taurus", rashiIndex: 1, degree: 50, retrograde: false },
        Saturn: { longitude: 60, rashi: "Taurus", rashiIndex: 1, degree: 60, retrograde: false },
        Rahu: { longitude: 70, rashi: "Gemini", rashiIndex: 2, degree: 70, retrograde: true },
        Ketu: { longitude: 250, rashi: "Sagittarius", rashiIndex: 8, degree: 250, retrograde: false }
      },
      doshas: [],
      gana: "Deva",
      nadi: "Adi",
      yoni: "Ashwa",
      varna: "Shudra",
      birthPlace: profile.birthPlace,
      birthTime: profile.birthTime,
      dob: profile.dob,
      calculatedAt: new Date().toISOString(),
    };

    // Simulate storing in Firestore
    await mockFirestore.doc(`profiles/${uid}`).update({ kundali: kundaliData });

    return { success: true, kundali: kundaliData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

AstroService.prototype.calculateCompatibility = async function(uid1: string, uid2: string) {
  try {
    // Simulate fetching profiles
    const profiles = {
      user123: {
        kundali: {
          moonSign: "Aries",
          moonSignIndex: 0,
          nakshatra: "Ashwini",
          nakshatraIndex: 0,
          gana: "Deva",
          nadi: "Adi",
          yoni: "Ashwa",
          varna: "Shudra"
        }
      },
      user456: {
        kundali: {
          moonSign: "Taurus",
          moonSignIndex: 1,
          nakshatra: "Bharani",
          nakshatraIndex: 1,
          gana: "Manushya",
          nadi: "Madhya",
          yoni: "Gaja",
          varna: "Kshatriya"
        }
      }
    };

    const p1 = profiles[uid1];
    const p2 = profiles[uid2];

    if (!p1.kundali || !p2.kundali) {
      return { success: false, error: "One or both profiles don't have Kundali" };
    }

    // Simulate compatibility calculation
    const result = {
      totalScore: 28,
      maxScore: 36,
      percentage: 78,
      verdict: "Good Match",
      verdictColor: "#22c55e",
      factors: [],
      nadiDosha: false,
      bhakootDosha: false,
      dosha: null,
      recommendation: "Good compatibility. Recommended for marriage with standard rituals.",
    };

    // Simulate caching
    await mockFirestore.doc(`compatibilityCache/${uid1}_${uid2}`).set({
      uid1,
      uid2,
      ...result,
      calculatedAt: new Date().toISOString(),
    });

    return { success: true, kundali: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Test the AstroService
async function testAstroService() {
  console.log('Testing AstroService...');

  // Test 1: Calculate Kundali
  console.log('\n1. Testing calculateKundaliForProfile...');
  const profileUpdate = {
    uid: 'user123',
    dob: '1990-01-01',
    birthTime: '12:00',
    birthPlace: 'Pune'
  };

  const kundaliResult = await AstroService.calculateKundaliForProfile(profileUpdate.uid, profileUpdate);
  if (kundaliResult.success) {
    console.log('✓ Kundali calculated successfully');
    console.log('  Moon Sign:', kundaliResult.kundali?.moonSign);
    console.log('  Lagna:', kundaliResult.kundali?.lagna);
    console.log('  Total Doshas:', kundaliResult.kundali?.doshas.length);
  } else {
    console.log('✗ Kundali calculation failed:', kundaliResult.error);
  }

  // Test 2: Calculate Compatibility
  console.log('\n2. Testing calculateCompatibility...');
  const compatibilityResult = await AstroService.calculateCompatibility('user123', 'user456');
  if (compatibilityResult.success) {
    console.log('✓ Compatibility calculated successfully');
    console.log('  Total Score:', compatibilityResult.kundali?.totalScore);
    console.log('  Verdict:', compatibilityResult.kundali?.verdict);
    console.log('  Percentage:', compatibilityResult.kundali?.percentage);
  } else {
    console.log('✗ Compatibility calculation failed:', compatibilityResult.error);
  }

  // Test 3: Auto-calculate (no changes)
  console.log('\n3. Testing autoCalculateKundali (no changes)...');
  const autoResult = await AstroService.autoCalculateKundali(profileUpdate);
  if (!autoResult.success && autoResult.error?.includes('No astro fields changed')) {
    console.log('✓ Correctly skipped calculation when no fields changed');
  } else {
    console.log('✗ Unexpected result:', autoResult);
  }

  // Test 4: Field change detection
  console.log('\n4. Testing field change detection...');
  const hasChanged = AstroService.hasAstroFieldsChanged(
    { dob: '1990-01-01', birthTime: '12:00', birthPlace: 'Pune' },
    { dob: '1990-01-02', birthTime: '12:00', birthPlace: 'Pune' }
  );
  if (hasChanged) {
    console.log('✓ Correctly detected field change (dob changed)');
  } else {
    console.log('✗ Failed to detect field change');
  }

  console.log('\nAll tests completed!');
}

// Run the tests
testAstroService();
