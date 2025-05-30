"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Feeding {
  foodType?: string;
  dailyQuantity?: string;
  frequency?: string;
  specialNeeds?: string;
}

interface Hygiene {
  bathFrequency?: string;
  brushFrequency?: string;
  dentalCleaningFrequency?: string;
  cleaningEars?: string;
  cuttingNails?: string;
  notes?: string;
}

interface Exercise {
  excerciseType?: string;
  duration?: string;
  frequency?: string;
  observations?: string;
}

interface DailyCare {
  feeding?: Feeding;
  hygiene?: Hygiene;
  exercise?: Exercise;
}

interface DailyCareFormProps {
  initialData?: DailyCare;
  onSubmit: (data: DailyCare) => void;
  onCancel: () => void;
  petId: string;
  category?: 'feeding' | 'hygiene' | 'exercise';
}

const DailyCareForm: React.FC<DailyCareFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  petId: _petId, // Prefix with underscore to indicate intentionally unused
  category = 'feeding'
}) => {
  const [activeTab, setActiveTab] = useState<'feeding' | 'hygiene' | 'exercise'>(category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form with react-hook-form
  const { register, handleSubmit, formState: { errors: _errors }, reset } = useForm<DailyCare>({
    defaultValues: initialData || {
      feeding: {
        foodType: '',
        dailyQuantity: '',
        frequency: '',
        specialNeeds: ''
      },
      hygiene: {
        bathFrequency: '',
        brushFrequency: '',
        dentalCleaningFrequency: '',
        cleaningEars: '',
        cuttingNails: '',
        notes: ''
      },
      exercise: {
        excerciseType: '',
        duration: '',
        frequency: '',
        observations: ''
      }
    }
  });
  
  // Reset form if initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);
  
  // Handle form submission
  const handleFormSubmit = async (data: DailyCare) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          {initialData ? 'Edit Daily Care' : 'Add Daily Care Information'}
        </h3>
        
        {/* Tabs for different care categories */}
        <div className="flex mb-6 space-x-4 border-b border-gray-200">
        <button
        onClick={() => setActiveTab('feeding')}
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
          shadow-none 
          bg-white 
          hover:cursor-pointer
          ${activeTab === 'feeding'
            ? 'text-[#3479ba]'
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        Feeding
        {activeTab === 'feeding' && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
        )}
      </button>
      
      <button
        onClick={() => setActiveTab('hygiene')}
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
          shadow-none 
          bg-white 
          hover:cursor-pointer
          ${activeTab === 'hygiene'
            ? 'text-[#3479ba]'
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        Hygiene
        {activeTab === 'hygiene' && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
        )}
      </button>
      
      <button
        onClick={() => setActiveTab('exercise')}
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
          shadow-none 
          bg-white 
          hover:cursor-pointer
          ${activeTab === 'exercise'
            ? 'text-[#3479ba]'
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        Exercise
        {activeTab === 'exercise' && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
        )}
      </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Feeding Section */}
          <div className={activeTab === 'feeding' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label htmlFor="feeding.foodType" className="block text-xl font-medium text-gray-700">
                  Food Type
                </label>
                <input
                  type="text"
                  id="feeding.foodType"
                  {...register('feeding.foodType')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., Dry food, canned food, etc."
                />
              </div>
              
              <div>
                <label htmlFor="feeding.dailyQuantity" className="block text-xl font-medium text-gray-700">
                  Daily Quantity
                </label>
                <input
                  type="text"
                  id="feeding.dailyQuantity"
                  {...register('feeding.dailyQuantity')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., 1 cup, 200g, etc."
                />
              </div>
              
              <div>
                <label htmlFor="feeding.frequency" className="block text-xl font-medium text-gray-700">
                  Frequency
                </label>
                <input
                  type="text"
                  id="feeding.frequency"
                  {...register('feeding.frequency')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., twice a day, three times a day, etc."
                />
              </div>
              
              <div>
                <label htmlFor="feeding.specialNeeds" className="block text-xl font-medium text-gray-700">
                  Special Needs
                </label>
                <textarea
                  id="feeding.specialNeeds"
                  rows={3}
                  {...register('feeding.specialNeeds')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., allergies, dietary restrictions, etc."
                />
              </div>
            </div>
          </div>
          
          {/* Hygiene Section */}
          <div className={activeTab === 'hygiene' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label htmlFor="hygiene.bathFrequency" className="block text-xl font-medium text-gray-700">
                  Bath Frequency
                </label>
                <input
                  type="text"
                  id="hygiene.bathFrequency"
                  {...register('hygiene.bathFrequency')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., once a week, every two weeks, etc."
                />
              </div>
              
              <div>
                <label htmlFor="hygiene.brushFrequency" className="block text-xl font-medium text-gray-700">
                  Brush Frequency
                </label>
                <input
                  type="text"
                  id="hygiene.brushFrequency"
                  {...register('hygiene.brushFrequency')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., daily, twice a week, etc."
                />
              </div>
              
              <div>
                <label htmlFor="hygiene.dentalCleaningFrequency" className="block text-xl font-medium text-gray-700">
                  Dental Cleaning Frequency
                </label>
                <input
                  type="text"
                  id="hygiene.dentalCleaningFrequency"
                  {...register('hygiene.dentalCleaningFrequency')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., daily, weekly, etc."
                />
              </div>
              
              <div>
                <label htmlFor="hygiene.cleaningEars" className="block text-xl font-medium text-gray-700">
                  Ear Cleaning Frequency
                </label>
                <input
                  type="text"
                  id="hygiene.cleaningEars"
                  {...register('hygiene.cleaningEars')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., weekly, monthly, etc."
                />
              </div>
              
              <div>
                <label htmlFor="hygiene.cuttingNails" className="block text-xl font-medium text-gray-700">
                  Nail Cutting Frequency
                </label>
                <input
                  type="text"
                  id="hygiene.cuttingNails"
                  {...register('hygiene.cuttingNails')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., monthly, as needed, etc."
                />
              </div>
              
              <div>
                <label htmlFor="hygiene.notes" className="block text-xl font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="hygiene.notes"
                  rows={3}
                  {...register('hygiene.notes')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="Any additional hygiene-related notes"
                />
              </div>
            </div>
          </div>
          
          {/* Exercise Section */}
          <div className={activeTab === 'exercise' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label htmlFor="exercise.excerciseType" className="block text-xl font-medium text-gray-700">
                  Exercise Type
                </label>
                <input
                  type="text"
                  id="exercise.excerciseType"
                  {...register('exercise.excerciseType')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., walks, games, etc."
                />
              </div>
              
              <div>
                <label htmlFor="exercise.duration" className="block text-xl font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  id="exercise.duration"
                  {...register('exercise.duration')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., 30 minutes, 1 hour, etc."
                />
              </div>
              
              <div>
                <label htmlFor="exercise.frequency" className="block text-xl font-medium text-gray-700">
                  Frequency
                </label>
                <input
                  type="text"
                  id="exercise.frequency"
                  {...register('exercise.frequency')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="E.g., daily, twice a day, etc."
                />
              </div>
              
              <div>
                <label htmlFor="exercise.observations" className="block text-xl font-medium text-gray-700">
                  Observations
                </label>
                <textarea
                  id="exercise.observations"
                  rows={3}
                  {...register('exercise.observations')}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
                  placeholder="Additional observations about exercise habits"
                />
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xl font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba] disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyCareForm;