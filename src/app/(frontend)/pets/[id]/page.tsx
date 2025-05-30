"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MedicalRecordComponent from '@/components/ui/MedicalRecordComponent';
import DailyCareComponent from '@/components/DailyCareComponent';
import RemindersComponent from '@/components/RemindersComponent';
import { MedicalRecord, Reminder } from '@/utilities/MedicalRecord';
import { ArrowLeft } from 'lucide-react';

// Define interfaces for the medical record items
interface VaccineItem {
  vaccineType?: string;
  dateAdministered?: string;
  nextDose?: string;
  batchNumber?: string;
  [key: string]: unknown;
}

interface DewormingItem {
  dewormingType?: string;
  dateAdministered?: string;
  frequency?: string;
  [key: string]: unknown;
}

interface VetAppointmentItem {
  appointmentDate?: string;
  reason?: string;
  diagnosis?: string;
  treatment?: string;
  [key: string]: unknown;
}

interface SurgicalProcedureItem {
  procedureType?: string;
  date?: string;
  complications?: string;
  postOperativeMedication?: string;
  [key: string]: unknown;
}

interface AllergyItem {
  allergyType?: string;
  description?: string;
  [key: string]: unknown;
}

interface LaboratoryTestItem {
  testType?: string;
  date?: string;
  results?: string;
  [key: string]: unknown;
}

interface MedicalTreatmentItem {
  medicationName?: string;
  dosage?: string;
  duration?: string;
  additionalTherapies?: string;
  [key: string]: unknown;
}

interface EvolutionTrackingItem {
  date?: string;
  notes?: string;
  treatmentChanges?: string;
  [key: string]: unknown;
}

// Types
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
    url: string;
  };
  petOwner?: {
    id: string;
    name: string;
  } | string;
  petCarer?: {
    id: string;
    name: string;
  } | string;
  medicalRecord?: MedicalRecord;
  dailyCare?: {
    feeding?: {
      foodType?: string;
      dailyQuantity?: string;
      frequency?: string;
      specialNeeds?: string;
    };
    hygiene?: {
      bathFrequency?: string;
      brushFrequency?: string;
      dentalCleaningFrequency?: string;
      cleaningEars?: string;
      cuttingNails?: string;
      notes?: string;
    };
    exercise?: {
      excerciseType?: string;
      duration?: string;
      frequency?: string;
      observations?: string;
    };
  };
  reminders?: Array<{
    type: string;
    date: string;
    time?: string;
    description?: string;
  }>;
  qrLink?: string;
}

type TabType = 'general' | 'medical' | 'care' | 'reminders';

interface PageProps {
  params: Promise<{ id: string }>;
}

const PetDetailPage = ({ params }: PageProps) => {
  // Use React.use() to unwrap the Promise
  const { id: petId } = React.use(params);
  
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        // First fetch current user to check permissions
        const userResponse = await fetch('/api/users/me', {
          credentials: 'include',
        });
        
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        const userId = userData.user?.id;
        
        // Now fetch the pet details
        const petResponse = await fetch(`/api/pets/${petId}`, {
          credentials: 'include',
        });
        
        if (!petResponse.ok) {
          throw new Error('Failed to fetch pet details');
        }
        
        const petData = await petResponse.json();
        
        // Transform the medical record data to match the expected MedicalRecord type
        if (petData.medicalRecord) {
          // Transform vaccines to include id
          if (petData.medicalRecord.vaccines) {
            petData.medicalRecord.vaccines = petData.medicalRecord.vaccines.map((vaccine: VaccineItem, index: number) => ({
              id: `vaccine-${index}`, // Add an id property to each vaccine
              ...vaccine
            }));
          }
          
          // Similar transformations for other arrays in the medical record
          if (petData.medicalRecord.deworming) {
            petData.medicalRecord.deworming = petData.medicalRecord.deworming.map((deworming: DewormingItem, index: number) => ({
              id: `deworming-${index}`,
              ...deworming
            }));
          }
          
          if (petData.medicalRecord.vetAppointments) {
            petData.medicalRecord.vetAppointments = petData.medicalRecord.vetAppointments.map((appointment: VetAppointmentItem, index: number) => ({
              id: `appointment-${index}`,
              ...appointment
            }));
          }
          
          if (petData.medicalRecord.surgicalProcedures) {
            petData.medicalRecord.surgicalProcedures = petData.medicalRecord.surgicalProcedures.map((procedure: SurgicalProcedureItem, index: number) => ({
              id: `procedure-${index}`,
              ...procedure
            }));
          }
          
          if (petData.medicalRecord.allergies) {
            petData.medicalRecord.allergies = petData.medicalRecord.allergies.map((allergy: AllergyItem, index: number) => ({
              id: `allergy-${index}`,
              ...allergy
            }));
          }
          
          if (petData.medicalRecord.laboratoryTests) {
            petData.medicalRecord.laboratoryTests = petData.medicalRecord.laboratoryTests.map((test: LaboratoryTestItem, index: number) => ({
              id: `test-${index}`,
              ...test
            }));
          }
          
          if (petData.medicalRecord.medicalTreatments) {
            petData.medicalRecord.medicalTreatments = petData.medicalRecord.medicalTreatments.map((treatment: MedicalTreatmentItem, index: number) => ({
              id: `treatment-${index}`,
              ...treatment
            }));
          }
          
          if (petData.medicalRecord.evolutionTracking) {
            petData.medicalRecord.evolutionTracking = petData.medicalRecord.evolutionTracking.map((tracking: EvolutionTrackingItem, index: number) => ({
              id: `tracking-${index}`,
              ...tracking
            }));
          }
        }
        
        setPet(petData);
        
        // Check if current user is the pet owner
        if (petData.petOwner) {
          const ownerId = typeof petData.petOwner === 'object' ? petData.petOwner.id : petData.petOwner;
          setIsOwner(ownerId === userId || userData.user?.roles === 'admin');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (petId) {
      fetchPetData();
    }
  }, [petId, router]);

  const handleRemindersUpdate = async (updatedReminders: Reminder[]) => {
    try {
      console.log('Sending updated reminders:', JSON.stringify(updatedReminders, null, 2));
      
      // Make API call to update the reminders
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminders: updatedReminders }),
      });
      
      if (!response.ok) {
        // Get more details about the error
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {
          errorData = null;
        }
        
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to update reminders: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const updatedPetData = await response.json();
      console.log("Update successful, received:", updatedPetData);
      
      // Important: Update the local pet state to trigger re-render
      if (pet) {
        setPet({
          ...pet,
          reminders: updatedReminders
        });
      }
    } catch (err) {
      console.error("Error updating reminders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  const handleBack = () => {
    router.push('/my-dashboard');
  };

  const handleEditPet = () => {
    router.push(`/pets/${petId}/edit`);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    if (!deleting) {
      setShowDeleteConfirm(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pet) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/pets/${pet.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }
      
      // Only hide the modal after successful deletion
      setShowDeleteConfirm(false);
      
      // Redirect to dashboard after successful deletion
      router.push('/my-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
      // Don't hide the modal on error, allow user to try again
      setDeleting(false);
    }
  };

  const handleMedicalRecordUpdate = async (updatedRecord: MedicalRecord) => {
    try {
      console.log('Sending updated medical record:', JSON.stringify(updatedRecord, null, 2));
      
      // Make API call to update the medical record - use PATCH to match PetService
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PATCH', // Changed from PUT to PATCH
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medicalRecord: updatedRecord }), // Wrap in medicalRecord property
      });
      
      if (!response.ok) {
        // Get more details about the error
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {
          errorData = null;
        }
        
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to update medical record: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const updatedPetData = await response.json();
      console.log("Update successful, received:", updatedPetData);
      
      // Important: Update the local pet state to trigger re-render
      if (pet) {
        setPet({
          ...pet,
          medicalRecord: updatedRecord
        });
      }
    } catch (err) {
      console.error("Error updating medical record:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  }

  // Tab rendering helper
  const renderTabContent = () => {
    if (!pet) return null;
    
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="px-4 py-5 bg-white rounded-lg shadow sm:p-6">
              <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight">General Information</h3>
              <div className="mt-5 border-t border-gray-200">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-xl font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">{pet.name}</dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-xl font-medium text-gray-500">Species</dt>
                    <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">
                      {pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : pet.species}
                    </dd>
                  </div>
                  {pet.breed && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Breed</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">{pet.breed}</dd>
                    </div>
                  )}
                  {pet.sex && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Sex</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">
                        {pet.sex === 'male' ? 'Male' : 'Female'}
                      </dd>
                    </div>
                  )}
                  {pet.age !== undefined && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Age</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">{pet.age} years</dd>
                    </div>
                  )}
                  {pet.height !== undefined && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Height</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">{pet.height} cm</dd>
                    </div>
                  )}
                  {pet.weight !== undefined && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Weight</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">{pet.weight} kg</dd>
                    </div>
                  )}
                  {pet.petCarer && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">Pet Carer</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">
                        {typeof pet.petCarer === 'object' ? pet.petCarer.name : 'Assigned'}
                      </dd>
                    </div>
                  )}
                  {pet.qrLink && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-xl font-medium text-gray-500">QR Code</dt>
                      <dd className="mt-1 text-xl text-gray-900 sm:mt-0 sm:col-span-2">
                        <a 
                          href={pet.qrLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#3479ba] hover:text-[#3479ba]"
                        >
                          View QR Code
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        );
      case 'medical':
        return <MedicalRecordComponent medicalRecord={pet.medicalRecord} petId={pet.id} isOwner={isOwner}    onUpdateRecord={handleMedicalRecordUpdate} />;
      case 'care':
        return <DailyCareComponent dailyCare={pet.dailyCare} petId={pet.id} isOwner={isOwner} />;
      case 'reminders':
        return <RemindersComponent 
          reminders={pet.reminders} 
          petId={pet.id} 
          isOwner={isOwner} 
          onUpdate={handleRemindersUpdate}
        />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full border--600 animate-spin"></div>
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

  if (!pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Pet not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 z-10 px-4  py-1  mt-2 rounded-md font-normal text-lg 
                     text-white bg-[#001e4c] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#001e4c] hover:border-[#001e4c]
                     transition-all duration-300 hover:cursor-pointer my-4 "
        >
       <ArrowLeft/>
          Back to Dashboard
        </button>

        {/* Pet profile header */}
        <div className="mb-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              {pet.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.photo.url}
                  alt={pet.name}
                  className="object-cover w-16 h-16 mr-4 rounded-full"
                />
              )}
              <div className='flex flex-col justify-start'>
                <h1 className="text-[#001e4c] pt-2  font-bold leading-none text-center 
          text-[36px]  tracking-tight">{pet.name}</h1>
                <p className="pl-2 my-0 text-xl text-gray-500">
                  {pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : pet.species}
                  {pet.breed && ` - ${pet.breed}`}
                </p>
              </div>
            </div>
            {isOwner && (
              <div className="flex mt-4 space-x-3 md:mt-0">
                <button
                  onClick={handleEditPet}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] hover:cursor-pointer hover:opacity-80"
                >
                  Edit Pet
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-gray-300 border border-transparent rounded-md shadow-sm hover:cursor-pointer hover:opacity-80"
                >
                  Delete Pet Record
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="mb-4 ">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
  <button
    onClick={() => setActiveTab('general')}
    className={`
      py-4 
      px-1 
      text-xl 
      font-medium 
      relative
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none bg-[#F9FAFB]  hover:cursor-pointer
      ${activeTab === 'general'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    General
    {activeTab === 'general' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveTab('medical')}
    className={`
      py-4 
      px-1 
      text-xl 
      font-medium 
      relative
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none bg-[#F9FAFB]  hover:cursor-pointer
      ${activeTab === 'medical'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Medical Record
    {activeTab === 'medical' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveTab('care')}
    className={`
      py-4 
      px-1 
      text-xl 
      font-medium 
      relative
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none bg-[#F9FAFB]  hover:cursor-pointer
      ${activeTab === 'care'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Daily Care
    {activeTab === 'care' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveTab('reminders')}
    className={`
      py-4 
      px-1 
      text-xl 
      font-medium 
      relative
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none bg-[#F9FAFB]  hover:cursor-pointer
      ${activeTab === 'reminders'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Reminders
    {activeTab === 'reminders' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
</nav>
        </div>

        {/* Tab content */}
        {renderTabContent()}

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
  <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div className="flex items-center justify-center min-h-screen">
      {/* Modal backdrop with click handler to close */}
      <div 
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
        aria-hidden="true"
        onClick={handleCancelDelete}
      ></div>
      
      {/* Modal panel - stopping propagation so clicks inside don't close modal */}
      <div 
        className="relative overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              {deleting ? (
                <svg className="w-6 h-6 text-red-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                {deleting ? 'Deleting Pet...' : 'Delete Pet'}
              </h3>
              <div className="mt-2">
                <p className="text-xl text-gray-500">
                  {deleting 
                    ? `Deleting ${pet.name}... Please wait.` 
                    : `Are you sure you want to delete ${pet.name}? This action cannot be undone and all associated data will be permanently removed.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            disabled={deleting}
            onClick={handleConfirmDelete}
            className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-xl ${
              deleting 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={handleCancelDelete}
            className={`mt-3 sm:mt-0 inline-flex justify-center w-full px-4 py-2 text-base font-medium border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-xl ${
              deleting
                ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-[#3479ba]'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default PetDetailPage;