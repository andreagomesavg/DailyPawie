import { MedicalRecord } from '@/utilities/MedicalRecord';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image'; // ✅ AÑADIDO: Next.js Image optimizado

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
    alt?: string;
    // ✅ AÑADIDO: Soporte para tamaños optimizados de Vercel Blob
    sizes?: {
      thumbnail?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
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

// ✅ OPTIMIZADO: Helper function mejorada para URLs
function getBaseUrl(): string {
  // En producción (Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Variable de entorno personalizada
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }
  
  // Desarrollo local
  return 'http://localhost:3000';
}

async function getUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const baseUrl = getBaseUrl();
    
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieStore.toString(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        return null;
      }
      console.error('Failed to fetch user:', res.status, res.statusText);
      throw new Error(`Failed to fetch user data: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

async function getPet(petId: string): Promise<Pet> {
  try {
    const cookieStore = cookies();
    const baseUrl = getBaseUrl();
    
    const res = await fetch(`${baseUrl}/api/pets/${petId}`, {
      method: 'GET',
      headers: {
        'Cookie': cookieStore.toString(),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error('Failed to fetch pet:', res.status, res.statusText);
      throw new Error(`Failed to fetch pet details: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in getPet:', error);
    throw error;
  }
}

// ✅ AÑADIDO: Helper para obtener la mejor URL de imagen
function getOptimalImageUrl(photo: Pet['photo'], size: 'thumbnail' | 'medium' | 'large' = 'medium'): string | null {
  if (!photo) return null;
  
  // Priorizar tamaños optimizados de Vercel Blob
  if (photo.sizes && photo.sizes[size]) {
    return photo.sizes[size].url;
  }
  
  // Fallback a la URL original
  return photo.url || null;
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
    console.error('Error in PetDetailPage:', err);
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

  // ✅ OPTIMIZADO: Obtener URLs de imagen optimizadas
  const imageUrl = getOptimalImageUrl(pet.photo, 'large');
  const thumbnailUrl = getOptimalImageUrl(pet.photo, 'thumbnail');

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

        {/* Pet Header - ✅ OPTIMIZADO */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="md:flex">
            {/* Pet Photo - ✅ COMPLETAMENTE REESCRITO */}
            <div className="md:w-1/3 relative">
              {imageUrl ? (
                <div className="relative w-full h-64 md:h-full min-h-[300px]">
                  <Image
                    src={imageUrl}
                    alt={pet.photo?.alt || `Foto de ${pet.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                    placeholder={thumbnailUrl ? "blur" : "empty"}
                    blurDataURL={thumbnailUrl || undefined}
                  />
                </div>
              ) : (
                <div className="w-full h-64 md:h-full min-h-[300px] bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto w-20 h-20 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-500">No photo uploaded</p>
                  </div>
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a] transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Pet
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 w-20">Species:</span>
                  <span className="ml-2 text-gray-900 capitalize">{pet.species}</span>
                </div>
                {pet.breed && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Breed:</span>
                    <span className="ml-2 text-gray-900">{pet.breed}</span>
                  </div>
                )}
                {pet.sex && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Gender:</span>
                    <span className="ml-2 text-gray-900 capitalize">{pet.sex}</span>
                  </div>
                )}
                {pet.age && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Age:</span>
                    <span className="ml-2 text-gray-900">{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
                  </div>
                )}
                {pet.height && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Height:</span>
                    <span className="ml-2 text-gray-900">{pet.height} cm</span>
                  </div>
                )}
                {pet.weight && (
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-700 w-20">Weight:</span>
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
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-[#3479ba] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900">Medical Records</h2>
            </div>
            {pet.medicalRecord ? (
              <div className="space-y-4">
                <p className="text-gray-600">Medical records available. Click to view details.</p>
                <a
                  href={`/pets/${petId}/medical`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white transition-colors"
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a] transition-colors"
                  >
                    Add Medical Record
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Daily Care Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-[#3479ba] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900">Daily Care</h2>
            </div>
            {pet.dailyCare ? (
              <div className="space-y-4">
                <p className="text-gray-600">Daily care routine available.</p>
                <a
                  href={`/pets/${petId}/daily-care`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white transition-colors"
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a] transition-colors"
                  >
                    Set Daily Care
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Reminders Section */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-[#3479ba] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900">Reminders</h2>
            </div>
            {pet.reminders && pet.reminders.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600">{pet.reminders.length} reminder(s) set</p>
                <a
                  href={`/pets/${petId}/reminders`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#3479ba] border border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white transition-colors"
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a] transition-colors"
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