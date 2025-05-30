"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  image?: {
    url: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  ownedPets?: Pet[];
  caredPets?: Pet[];
}

// Pet Creation Form Component
const PetCreationForm = ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/pets', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create pet');
      }

      const data = await response.json();
      console.log('Pet created:', data);
      
      // Call onSuccess callback to refresh the page
      onSuccess();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Add New Pet</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="photo" className="block text-xl font-medium text-gray-700">Pet Photo</label>
          <input 
            type="file" 
            name="photo" 
            id="photo" 
            required 
            accept="image/*"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-xl font-medium text-gray-700">Pet Name</label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            required 
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          />
        </div>

        <div>
          <label htmlFor="species" className="block text-xl font-medium text-gray-700">Species</label>
          <select 
            name="species" 
            id="species" 
            required
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          >
            <option value="">Select species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="another">Another</option>
          </select>
        </div>

        <div>
          <label htmlFor="breed" className="block text-xl font-medium text-gray-700">Breed</label>
          <input 
            type="text" 
            name="breed" 
            id="breed" 
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          />
        </div>

        <div>
          <label htmlFor="sex" className="block text-xl font-medium text-gray-700">Sex</label>
          <select 
            name="sex" 
            id="sex"
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          >
            <option value="">Select sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label htmlFor="age" className="block text-xl font-medium text-gray-700">Age (years)</label>
          <input 
            type="number" 
            name="age" 
            id="age" 
            min="0" 
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          />
        </div>

        {error && <div className="text-xl text-red-600">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      
      // If user is admin, redirect to admin dashboard
      if (data.user?.roles === 'admin') {
        router.push('/admin');
        return;
      }

      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePetCreated = () => {
    setShowAddPetForm(false);
    fetchUserData(); // Refresh user data to show the new pet
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* User Profile Section */}
        <div className="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Welcome, {user.name}
            </h3>
            <p className="max-w-2xl mt-1 text-xl text-gray-500">
              Role: {user.roles === 'petOwner' ? 'Pet Owner' : 'Pet Carer'}
            </p>
          </div>
        </div>

        {/* Owned Pets Section (for Pet Owners) */}
        {user.roles === 'petOwner' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
              {user.ownedPets && user.ownedPets.length > 0 && (
                <button
                  onClick={() => setShowAddPetForm(true)}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
                >
                  Add New Pet
                </button>
              )}
            </div>

            {showAddPetForm ? (
              <PetCreationForm 
                onCancel={() => setShowAddPetForm(false)} 
                onSuccess={handlePetCreated}
              />
            ) : user.ownedPets && user.ownedPets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {user.ownedPets.map((pet) => (
                  <div key={pet.id} className="overflow-hidden bg-white rounded-lg shadow">
                    {pet.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pet.image.url}
                        alt={pet.name}
                        className="object-cover w-full h-48"
                      />
                    )}
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">{pet.name}</h3>
                      <p className="mt-1 text-xl text-gray-500">
                        {pet.type} {pet.breed && `- ${pet.breed}`}
                      </p>
                      {pet.age && (
                        <p className="mt-1 text-xl text-gray-500">Age: {pet.age} years</p>
                      )}
                    </div>
                    <div className="px-4 py-4 bg-gray-50 sm:px-6">
                      <button
                        onClick={() => router.push(`/pets/${pet.id}`)}
                        className="text-xl font-medium text-[#3479ba] hover:text-[#3479ba]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow">
                <p className="mb-4 text-gray-500">You havent added any pets yet.</p>
                <button
                  onClick={() => setShowAddPetForm(true)}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
                >
                  Add Your First Pet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cared Pets Section (for Pet Carers) */}
        {user.roles === 'petCarer' && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Pets I Care For</h2>
            {user.caredPets && user.caredPets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {user.caredPets.map((pet) => (
                  <div key={pet.id} className="overflow-hidden bg-white rounded-lg shadow">
                    {pet.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pet.image.url}
                        alt={pet.name}
                        className="object-cover w-full h-48"
                      />
                    )}
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">{pet.name}</h3>
                      <p className="mt-1 text-xl text-gray-500">
                        {pet.type} {pet.breed && `- ${pet.breed}`}
                      </p>
                      {pet.age && (
                        <p className="mt-1 text-xl text-gray-500">Age: {pet.age} years</p>
                      )}
                    </div>
                    <div className="px-4 py-4 bg-gray-50 sm:px-6">
                      <button
                        onClick={() => router.push(`/pets/${pet.id}`)}
                        className="text-xl font-medium text-[#3479ba] hover:text-[#3479ba]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow">
                <p className="mb-4 text-gray-500">You are not currently caring for any pets.</p>
                <button
                  onClick={() => router.push('/care-opportunities')}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
                >
                  Browse Care Opportunities
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;