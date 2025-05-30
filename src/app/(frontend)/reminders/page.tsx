'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { League_Spartan } from "next/font/google"
import AllRemindersComponent from '@/components/AllPetReminders';

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700", "500","600", "900"], 
  variable: "--font-spartan"
});

// Define proper interface for reminders instead of using 'any'
interface Reminder {
  id?: string;
  type: string;
  date: string;
  time?: string;
  description?: string;
  title?: string;
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  reminders?: Reminder[];
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  ownedPets?: Array<Pet | string>;
}

const RemindersPageRoute = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPetsData = useCallback(async (petIds: Array<string | Pet>) => {
    try {
      console.log('RemindersPageRoute - Starting to fetch pets data for IDs:', petIds);
      // Extract all pet IDs (they might be objects or strings)
      const ids = petIds.map(pet => typeof pet === 'object' ? pet.id : pet);
      console.log('RemindersPageRoute - Extracted pet IDs:', ids);
      
      // Fetch each pet's details
      const petsData = await Promise.all(
        ids.map(async (id) => {
          try {
            console.log(`RemindersPageRoute - Fetching pet ${id}...`);
            const response = await fetch(`/api/pets/${id}`, {
              credentials: 'include',
            });
            
            if (!response.ok) {
              console.error(`RemindersPageRoute - Failed to fetch pet ${id}: ${response.statusText}`);
              return null;
            }
            
            const data = await response.json();
            console.log(`RemindersPageRoute - Pet ${id} data:`, data);
            return data;
          } catch (error) {
            console.error(`RemindersPageRoute - Error fetching pet ${id}:`, error);
            return null;
          }
        })
      );
      
      // Filter out any null responses and set the pets state
      const validPets = petsData.filter(pet => pet !== null);
      console.log('RemindersPageRoute - Valid pets after filtering:', validPets);
      setPets(validPets);
    } catch (err) {
      console.error('RemindersPageRoute - Error fetching pets data:', err);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      console.log('RemindersPageRoute - Fetching user data...');
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('RemindersPageRoute - Unauthorized, redirecting to login');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log('RemindersPageRoute - User data received:', data);
      
      // If user is admin, redirect to admin dashboard
      if (data.user?.roles === 'admin') {
        console.log('RemindersPageRoute - Admin user, redirecting to admin');
        router.push('/admin');
        return;
      }

      setUser(data.user);

      // If user has ownedPets, fetch the pet details
      if (data.user?.ownedPets && data.user.ownedPets.length > 0) {
        console.log('RemindersPageRoute - User has pets, fetching pet details:', data.user.ownedPets);
        await fetchPetsData(data.user.ownedPets);
      } else {
        console.log('RemindersPageRoute - User has no pets');
      }
    } catch (err) {
      console.error('RemindersPageRoute - Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, fetchPetsData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${leagueSpartan.className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-b-2 border-[#3479ba] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reminders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${leagueSpartan.className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#3479ba] text-white rounded-md hover:bg-[#2c5aa0]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${leagueSpartan.className}`}>
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('RemindersPageRoute - Final render:', {
    user: user.name,
    userRoles: user.roles,
    pets: pets.length,
    petsData: pets
  });

  return (
    <div className={`mx-auto max-w-7xl px-5 ${leagueSpartan.className}`}>
      <AllRemindersComponent 
        userPets={pets} 
        isOwner={user.roles === 'petOwner'} 
         maxReminders={null}
      />
    </div>
  );
};

export default RemindersPageRoute;