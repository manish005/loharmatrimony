# Astro Functions Migration Guide

This document explains the migration of astro functions from cloud functions to backend implementation.

## Overview

The astro functions have been moved from the cloud functions directory (`frontend/functions/src/astrology/`) to a shared library (`frontend/src/utils/astrologyShared.ts`) and a backend service (`frontend/functions/src/astrologyService.ts`).

## Changes Made

### 1. Shared Astro Library (`frontend/src/utils/astrologyShared.ts`)

Created a new shared library containing all the core astro calculation logic:

- **Planet Position Calculations**: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- **Ascendant (Lagna) Calculation**: Based on birth location and time
- **Dosha Detection**: Mangal Dosha, Kaal Sarp Dosha, Pitra Dosha, Shani Sade Sati, Grahan Dosha
- **Constants**: Rashis, Nakshatras, Gana, Nadi, Yoni, Varna tables
- **Main Function**: `calculateKundali()` - Core kundali calculation function

### 2. Backend Astro Service (`frontend/functions/src/astrologyService.ts`)

Created a new backend service that handles astro calculations for profiles:

- **Auto-calculation**: Automatically calculates kundali when profile is updated with astro fields
- **Compatibility**: Calculates Ashtakoot compatibility between two profiles
- **Caching**: Caches compatibility results for quick retrieval
- **Field Change Detection**: Only recalculates when astro-related fields change (dob, birthTime, birthPlace)

### 3. Updated Cloud Functions (`frontend/functions/src/index.ts`)

Updated the cloud functions to use the shared astro library:

- **calculateKundaliFn**: Now uses `calculateKundali` from the shared library
- **getCompatibilityScore**: Now uses `calculateCompatibility` from the shared library

### 4. Updated Client-Side Utility (`frontend/src/utils/kundali.ts`)

Updated the client-side utility to use the shared astro library:

- **computeKundali**: Now uses `computeKundali` from the shared library
- **computeCompatibility**: Now uses `computeCompatibility` from the shared library

## Key Features

### 1. Automatic Calculation Trigger

The astro functions are now triggered automatically when:

- A user submits a profile and clicks save
- Any astro-related field is modified (birth time, birth place, birth date)

### 2. Results Display

Calculated results are automatically stored in the user's profile under the `kundali` field and can be displayed directly in the UI.

### 3. Compatibility Checking

The backend service provides a function to check astro compatibility between available profiles:

- **Ashtakoot (8-factor) scoring**: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi
- **Total Score**: Maximum 36 points
- **Verdict**: Excellent Match (≥30), Good Match (≥24), Average Match (≥18), Below Average (≥12), Poor Match (<12)

### 4. Efficient Recalculation

The system only recalculates kundali when astro-related fields are actually modified:

- **Birth Date**: If `dob` changes
- **Birth Time**: If `birthTime` changes
- **Birth Place**: If `birthPlace` changes

## Usage Examples

### 1. Auto-calculate Kundali

```typescript
import { AstroService } from './astrologyService';

const profileUpdate = {
  uid: 'user123',
  dob: '1990-01-01',
  birthTime: '12:00',
  birthPlace: 'Pune'
};

AstroService.autoCalculateKundali(profileUpdate)
  .then(result => {
    if (result.success) {
      console.log('Kundali calculated:', result.kundali);
    } else {
      console.error('Calculation failed:', result.error);
    }
  });
```

### 2. Calculate Compatibility

```typescript
import { AstroService } from './astrologyService';

AstroService.calculateCompatibility('user123', 'user456')
  .then(result => {
    if (result.success) {
      console.log('Compatibility score:', result.kundali.totalScore);
      console.log('Verdict:', result.kundali.verdict);
    } else {
      console.error('Compatibility calculation failed:', result.error);
    }
  });
```

### 3. Get Cached Compatibility

```typescript
import { AstroService } from './astrologyService';

AstroService.getCachedCompatibility('user123', 'user456')
  .then(result => {
    if (result.success) {
      console.log('Cached compatibility:', result.kundali);
    }
  });
```

## Benefits

1. **Single Source of Truth**: All astro logic is now in one place (`frontend/src/utils/astrologyShared.ts`)
2. **Efficient Updates**: Only recalculates when necessary
3. **Better Caching**: Compatibility results are cached for quick retrieval
4. **Consistent Results**: Both frontend and backend use the same calculation logic
5. **Scalable**: Easy to add new astro features or modify existing ones

## Migration Steps

1. **Update Profile Save Logic**: Ensure that when a profile is saved, the astro fields are checked and calculated if needed
2. **Display Results**: Add UI components to display kundali and compatibility results
3. **Test**: Verify that calculations are triggered correctly and results are displayed

## Files to Modify

### Frontend

- `frontend/src/utils/astrologyShared.ts` - New shared astro library
- `frontend/src/utils/kundali.ts` - Updated to use shared library
- Profile components - Add logic to trigger astro calculations

### Backend (Cloud Functions)

- `frontend/functions/src/astrologyService.ts` - New backend service
- `frontend/functions/src/index.ts` - Updated cloud functions

## Testing

To test the new implementation:

1. Create a test profile with astro fields (dob, birthTime, birthPlace)
2. Save the profile and verify that kundali is calculated
3. Check that the kundali data is stored in the profile
4. Test compatibility calculation between two profiles
5. Verify that recalculation only happens when astro fields change

## Future Enhancements

1. **Real-time Updates**: Implement real-time updates for compatibility scores
2. **Batch Processing**: Add support for batch processing multiple profiles
3. **Export**: Add functionality to export kundali data
4. **Validation**: Add validation for astro field inputs
5. **Error Handling**: Improve error handling and reporting

## Conclusion

The migration of astro functions from cloud functions to backend implementation provides a more efficient, scalable, and maintainable solution. The new architecture ensures that astro calculations are only performed when necessary, reducing unnecessary computations and improving performance.
