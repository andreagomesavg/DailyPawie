import { MedicalRecord } from '@/utilities/MedicalRecord';
import { redirect } from 'next/navigation';

interface DailyCare {
  id: string;
  feeding: string;
  exercise: string;
  medications?: string;
  notes?: string;
}

interface Reminder {
  id: string;
  title: string;
  date: Date;
  description?: string;
  completed: boolean;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
  photo?: {
    id: string;
    url: string;
  };
  petOwner?: {
    id: string;
  } | string;
  medicalRecord?: MedicalRecord | null;
  dailyCare?: DailyCare;
  reminders?: Reminder[];
}

interface User {
  user?: {
    id: string;
    role: string;
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getUser(): Promise<User | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/users/me`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Cookie: '' }, // Forward cookies if needed
  });
  if (!res.ok) {
    if (res.status === 401) {
      return null;
    }
    throw new Error('Failed to fetch user data');
  }
  return res.json();
}

async function getPet(petId: string): Promise<Pet> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pets/${petId}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Cookie: '' }, // Forward cookies if needed
  });
  if (!res.ok) {
    throw new Error('Failed to fetch pet details');
  }
  return res.json();
}

export default async function PetDetailPage({ params }: PageProps) {
  const { id: petId } = await params;

  if (!petId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Invalid pet ID</div>
      </div>
    );
  }

  let userData: User | null = null;
  let pet: Pet | null = null;
  let isOwner = false;
  let error: string | null = null;

  try {
    userData = await getUser();
    if (!userData) {
      redirect('/login');
    }
    pet = await getPet(petId);

    if (pet && pet.petOwner) {
      const ownerId = typeof pet.petOwner === 'object' ? pet.petOwner.id : pet.petOwner;
      isOwner = ownerId === userData.user?.id || userData.user?.role === 'admin';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'An error occurred';
  }

  if (error || !pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error || 'Pet not found'}</div>
          <a
            href="/my-dashboard"
            className="px-4 py-2 text-white bg-[#3479ba] rounded-md hover:bg-[#2a5d8a]"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <a
          href="/my-dashboard"
          className="flex items-center gap-2 z-10 px-4 py-1 mt-2 rounded-md font-normal text-lg 
                     text-white bg-[#001e4c] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#001e4c] hover:border-[#001e4c]
                     transition-all duration-300 hover:cursor-pointer my-4 opacity-90"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to Dashboard
        </a>

        {/* Pet Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Pet Photo */}
            <div className="md:w-1/3">
              {pet.photo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.photo.url}
                  alt={pet.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Pet Info */}
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                {isOwner && (
                  <a
                    href={`/pets/${petId}/edit`}
                    className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a]"
                  >
                    Edit Pet
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Species:</span>
                  <span className="ml-2 text-gray-900 capitalize">{pet.species}</span>
                </div>
                {pet.breed && (
                  <div>
                    <span className="font-semibold text-gray-700">Breed:</span>
                    <span className="ml-2 text-gray-900">{pet.breed}</span>
                  </div>
                )}
                {pet.sex && (
                  <div>
                    <span className="font-semibold text-gray-700">Sex:</span>
                    <span className="ml-2 text-gray-900 capitalize">{pet.sex}</span>
                  </div>
                )}
                {pet.age && (
                  <div>
                    <span className="font-semibold text-gray-700">Age:</span>
                    <span className="ml-2 text-gray-900">{pet.age} years</span>
                  </div>
                )}
                {pet.height && (
                  <div>
                    <span className="font-semibold text-gray-700">Height:</span>
                    <span className="ml-2 text-gray-900">{pet.height} cm</span>
                  </div>
                )}
                {pet.weight && (
                  <div>
                    <span className="font-semibold text-gray-700">Weight:</span>
                    <span className="ml-2 text-gray-900">{pet.weight} kg</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Medical Records Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Medical Records</h2>
            {pet.medicalRecord ? (
              <div className="space-y-4">
                {/* You can add specific medical record components here */}
                <p className="text-gray-600">Medical records available. Click to view details.</p>
                <a
                  href={`/pets/${petId}/medical`}
                  className="inline-flex items-center px-4 py-2 text-lg font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white"
                >
                  View Medical Records
                </a>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No medical records yet</p>
                {isOwner && (
                  <a
                    href={`/pets/${petId}/medical`}
                    className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a]"
                  >
                    Add Medical Record
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Daily Care Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Daily Care</h2>
            {pet.dailyCare ? (
              <div className="space-y-4">
                <p className="text-gray-600">Daily care routine available.</p>
                <a
                  href={`/pets/${petId}/daily-care`}
                  className="inline-flex items-center px-4 py-2 text-lg font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white"
                >
                  View Daily Care
                </a>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No daily care routine set</p>
                {isOwner && (
                  <a
                    href={`/pets/${petId}/daily-care`}
                    className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a]"
                  >
                    Set Daily Care
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Reminders Section */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reminders</h2>
            {pet.reminders && pet.reminders.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600">{pet.reminders.length} reminder(s) set</p>
                <a
                  href={`/pets/${petId}/reminders`}
                  className="inline-flex items-center px-4 py-2 text-lg font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white"
                >
                  View Reminders
                </a>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No reminders set</p>
                {isOwner && (
                  <a
                    href={`/pets/${petId}/reminders`}
                    className="inline-flex items-center px-4 py-2 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a]"
                  >
                    Add Reminder
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}