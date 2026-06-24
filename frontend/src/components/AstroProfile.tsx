// Astro Profile Component Example
// This demonstrates how to use the new AstroService in a React component

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AstroService } from '../services/astrologyService';

interface Profile {
  uid: string;
  name: string;
  dob?: string;
  birthTime?: string;
  birthPlace?: string;
  kundali?: any;
}

export const AstroProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch the profile from Firestore
      const mockProfile: Profile = {
        uid: user?.uid || '',
        name: 'John Doe',
        dob: '1990-01-01',
        birthTime: '12:00',
        birthPlace: 'Pune',
        kundali: null
      };
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (updates: Partial<Profile>) => {
    if (!profile) return;

    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);

    // Check if astro fields changed
    const hasAstroChanges = AstroService.hasAstroFieldsChanged(profile, updatedProfile);

    if (hasAstroChanges) {
      setCalculating(true);
      try {
        const result = await AstroService.autoCalculateKundali(updatedProfile);
        if (result.success) {
          console.log('Kundali calculated successfully:', result.kundali);
          // Update profile with calculated kundali
          setProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              kundali: result.kundali
            };
          });
        } else {
          console.error('Kundali calculation failed:', result.error);
        }
      } catch (error) {
        console.error('Error calculating kundali:', error);
      } finally {
        setCalculating(false);
      }
    }
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you'd save the profile to Firestore
      console.log('Profile saved:', profile);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Astro Profile</h1>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          {/* Basic Info Fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={profile?.name || ''}
              onChange={(e) => handleProfileUpdate({ name: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              value={profile?.dob || ''}
              onChange={(e) => handleProfileUpdate({ dob: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Birth Time</label>
            <input
              type="time"
              value={profile?.birthTime || ''}
              onChange={(e) => handleProfileUpdate({ birthTime: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Birth Place</label>
            <select
              value={profile?.birthPlace || ''}
              onChange={(e) => handleProfileUpdate({ birthPlace: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading || calculating}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading || calculating ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Kundali Display */}
      {profile?.kundali && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Kundali Results</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Details</h3>
              <p><strong>Moon Sign:</strong> {profile.kundali.moonSign}</p>
              <p><strong>Lagna:</strong> {profile.kundali.lagna}</p>
              <p><strong>Sun Sign:</strong> {profile.kundali.sunSign}</p>
              <p><strong>Nakshatra:</strong> {profile.kundali.nakshatra}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Compatibility Traits</h3>
              <p><strong>Gana:</strong> {profile.kundali.gana}</p>
              <p><strong>Nadi:</strong> {profile.kundali.nadi}</p>
              <p><strong>Yoni:</strong> {profile.kundali.yoni}</p>
              <p><strong>Varna:</strong> {profile.kundali.varna}</p>
            </div>
          </div>

          {profile.kundali.doshas && profile.kundali.doshas.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Doshas Detected</h3>
              <ul className="list-disc pl-5">
                {profile.kundali.doshas.map((dosha: any, index: number) => (
                  <li key={index} className="text-sm">
                    <strong>{dosha.name}:</strong> {dosha.description} ({dosha.severity})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>Calculated at: {profile.kundali.calculatedAt}</p>
          </div>
        </div>
      )}
    </div>
  );
};
