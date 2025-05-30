"use client"
import React, { useState, useEffect } from 'react';
import DailyCareForm from './DailyCareForm';
import PetService from '@/utilities/PetService';
import { DailyCare } from '@/types/DailyCareTypes';

// Import shared type definitions


interface DailyCareComponentProps {
  dailyCare?: DailyCare;
  petId: string;
  isOwner: boolean;
  onUpdate?: (dailyCare: DailyCare) => void;
}

type CareCategory = 'feeding' | 'hygiene' | 'exercise';

const DailyCareComponent: React.FC<DailyCareComponentProps> = ({ 
  dailyCare, 
  petId, 
  isOwner,
  onUpdate 
}) => {
  const [activeCategory, setActiveCategory] = useState<CareCategory>('feeding');
  const [formVisible, setFormVisible] = useState(false);
  const [localDailyCare, setLocalDailyCare] = useState<DailyCare | undefined>(dailyCare);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Effect to update local state when props change
  useEffect(() => {
    setLocalDailyCare(dailyCare);
  }, [dailyCare]);
  
  // Helper function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  // Handle form submission - make this sync to match DailyCareForm expectations
  const handleSaveDailyCare = (data: DailyCare) => {
    // Wrap async logic in a separate function
    const saveData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Saving daily care:", data);
        
        // Update local state optimistically for better UI responsiveness
        setLocalDailyCare(data);
        
        // Call API to update the pet's daily care information
        await PetService.updatePetDailyCare(petId, { ...data } );
        
        // Show success message
        showSuccessMessage("Daily care information saved successfully!");
        
        // Hide the form
        setFormVisible(false);
        
        // Notify parent component of the update
        if (onUpdate) {
          onUpdate(data);
        }
      } catch (err) {
        console.error("Error saving daily care information:", err);
        setError(err instanceof Error ? err.message : "Failed to save daily care information");
        
        // Revert local state if there was an error
        setLocalDailyCare(dailyCare);
      } finally {
        setLoading(false);
      }
    };
    
    // Call the async function
    saveData();
  };

  // Show the form if requested
  if (formVisible) {
    return (
      <DailyCareForm
        initialData={localDailyCare}
        onSubmit={handleSaveDailyCare}
        onCancel={() => setFormVisible(false)}
        petId={petId}
        category={activeCategory}
      />
    );
  }
  
  // If no daily care info available, show empty state
  if (!localDailyCare) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Daily Care</h3>
          <p className="text-gray-500">No daily care information available for this pet.</p>
          {isOwner && (
            <button
              onClick={() => setFormVisible(true)}
              className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Add Daily Care Information
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render feeding section
  const renderFeeding = () => {
    if (!localDailyCare.feeding || 
        (!localDailyCare.feeding.foodType && 
         !localDailyCare.feeding.dailyQuantity && 
         !localDailyCare.feeding.frequency && 
         !localDailyCare.feeding.specialNeeds)) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No feeding information available.</p>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('feeding');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Add Feeding Information
            </button>
          )}
        </div>
      );
    }

    const { foodType, dailyQuantity, frequency, specialNeeds } = localDailyCare.feeding;

    return (
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <h3 className="text-[32px] font-medium text-[#001e4c] ">Feeding Information</h3>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('feeding');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Edit
            </button>
          )}
        </div>
        <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {foodType && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Food Type</dt>
                <dd className="mt-1 text-xl text-gray-900">{foodType}</dd>
              </div>
            )}
            {dailyQuantity && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Daily Quantity</dt>
                <dd className="mt-1 text-xl text-gray-900">{dailyQuantity}</dd>
              </div>
            )}
            {frequency && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{frequency}</dd>
              </div>
            )}
            {specialNeeds && (
              <div className="sm:col-span-2">
                <dt className="text-xl font-medium text-gray-500">Special Needs</dt>
                <dd className="mt-1 text-xl text-gray-900">{specialNeeds}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  };

  // Render hygiene section
  const renderHygiene = () => {
    if (!localDailyCare.hygiene || 
        (!localDailyCare.hygiene.bathFrequency && 
         !localDailyCare.hygiene.brushFrequency && 
         !localDailyCare.hygiene.dentalCleaningFrequency && 
         !localDailyCare.hygiene.cleaningEars &&
         !localDailyCare.hygiene.cuttingNails &&
         !localDailyCare.hygiene.notes)) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No hygiene information available.</p>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('hygiene');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Add Hygiene Information
            </button>
          )}
        </div>
      );
    }

    const { 
      bathFrequency, 
      brushFrequency, 
      dentalCleaningFrequency, 
      cleaningEars,
      cuttingNails,
      notes 
    } = localDailyCare.hygiene;

    return (
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <h3 className="text-[32px] font-medium text-[#001e4c] ">Hygiene Information</h3>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('hygiene');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Edit
            </button>
          )}
        </div>
        <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {bathFrequency && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Bath Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{bathFrequency}</dd>
              </div>
            )}
            {brushFrequency && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Brush Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{brushFrequency}</dd>
              </div>
            )}
            {dentalCleaningFrequency && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Dental Cleaning Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{dentalCleaningFrequency}</dd>
              </div>
            )}
            {cleaningEars && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Ear Cleaning Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{cleaningEars}</dd>
              </div>
            )}
            {cuttingNails && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Nail Cutting Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{cuttingNails}</dd>
              </div>
            )}
            {notes && (
              <div className="sm:col-span-2">
                <dt className="text-xl font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-xl text-gray-900">{notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  };

  // Render exercise section
  const renderExercise = () => {
    if (!localDailyCare.exercise || 
        (!localDailyCare.exercise.excerciseType && 
         !localDailyCare.exercise.duration && 
         !localDailyCare.exercise.frequency && 
         !localDailyCare.exercise.observations)) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No exercise information available.</p>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('exercise');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Add Exercise Information
            </button>
          )}
        </div>
      );
    }

    const { excerciseType, duration, frequency, observations } = localDailyCare.exercise;

    return (
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <h3 className="text-[32px] font-medium text-[#001e4c] ">Exercise Information</h3>
          {isOwner && (
            <button
              onClick={() => {
                setActiveCategory('exercise');
                setFormVisible(true);
              }}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Edit
            </button>
          )}
        </div>
        <div className="px-4 py-5 border-t border-gray-200 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {excerciseType && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Exercise Type</dt>
                <dd className="mt-1 text-xl text-gray-900">{excerciseType}</dd>
              </div>
            )}
            {duration && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-xl text-gray-900">{duration}</dd>
              </div>
            )}
            {frequency && (
              <div>
                <dt className="text-xl font-medium text-gray-500">Frequency</dt>
                <dd className="mt-1 text-xl text-gray-900">{frequency}</dd>
              </div>
            )}
            {observations && (
              <div className="sm:col-span-2">
                <dt className="text-xl font-medium text-gray-500">Observations</dt>
                <dd className="mt-1 text-xl text-gray-900">{observations}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    );
  };

  // Render the active category content
  const renderContent = () => {
    switch (activeCategory) {
      case 'feeding':
        return renderFeeding();
      case 'hygiene':
        return renderHygiene();
      case 'exercise':
        return renderExercise();
      default:
        return renderFeeding();
    }
  };
  return (
    <div className="space-y-6">
      {/* Status messages */}
      {error && (
        <div className="px-4 py-2 mb-4 text-xl text-red-700 bg-red-100 border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="px-4 py-2 mb-4 text-xl text-green-700 bg-green-100 border-l-4 border-green-500">
          {successMessage}
        </div>
      )}
      
      {loading && (
        <div className="px-4 py-2 mb-4 text-xl text-blue-700 bg-blue-100 border-l-4 border-blue-500">
          Processing your request...
        </div>
      )}
      
      {/* Category navigation tabs */}
      <div className="flex mb-4 space-x-4 border-b border-gray-200">
  <button
    onClick={() => setActiveCategory('feeding')}
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
      ${activeCategory === 'feeding'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Feeding
    {activeCategory === 'feeding' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('hygiene')}
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
      shadow-none bg-[#F9FAFB] hover:cursor-pointer
      ${activeCategory === 'hygiene'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Hygiene
    {activeCategory === 'hygiene' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('exercise')}
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
      ${activeCategory === 'exercise'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Exercise
    {activeCategory === 'exercise' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
</div>
      
      {/* Render the content for the active category */}
      {renderContent()}
    </div>
  );
};

export default DailyCareComponent;