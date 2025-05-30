import React, { useState } from 'react';
import { Deworming } from '@/utilities/MedicalRecord';

interface DewormingFormProps {
  initialData?: Deworming;
  onSubmit: (deworming: Deworming) => void;
  onCancel: () => void;
  petId: string;
  dewormingId?: string; // Optional index for editing
}

const DewormingForm: React.FC<DewormingFormProps> = ({
  initialData = { id: '', type: '', antiparasitic: '', administrationDate: '', frequency: '' },
  onSubmit,
  onCancel,

  dewormingId
}) => {
  // For deworming type selection, use predefined options
  const [type, setType] = useState(initialData.type || '');
  const [antiparasitic, setAntiparasitic] = useState(initialData.antiparasitic || '');
  const [administrationDate, setAdministrationDate] = useState(initialData.administrationDate || '');
  const [frequency, setFrequency] = useState(initialData.frequency || '');
  
  // Predefined type options
  const dewormingTypeOptions = [
    'internal',
    'external',
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're editing an existing deworming or adding a new one
  const isEditing = initialData && initialData.type !== '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!type) {
      setError('Deworming type is required');
      setIsSubmitting(false);
      return;
    }

    // Create the deworming data object with ALL fields
    const dewormingData: Deworming = {
      id: dewormingId || "",
      type,
      antiparasitic,
      administrationDate,
      frequency,
    };

    console.log("Submitting deworming form with data:", dewormingData);

    try {
      // Call the onSubmit function to let parent component handle the API call
      onSubmit(dewormingData);
      // Don't close the form here - let the parent component decide when to close it
    } catch (err) {
      console.error("Error processing deworming:", err);
      setError(err instanceof Error ? err.message : "Failed to process deworming");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Deworming' : 'Add Deworming'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-xl font-medium text-gray-700">
            Deworming Type *
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="">Select a deworming type</option>
            {dewormingTypeOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="antiparasitic" className="block text-xl font-medium text-gray-700">
            Antiparasitic
          </label>
          <input
            type="text"
            id="antiparasitic"
            name="antiparasitic"
            value={antiparasitic}
            onChange={(e) => setAntiparasitic(e.target.value)}
            className="box-border  block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
  <div>
          <label htmlFor="administrationDate" className="block text-xl font-medium text-gray-700">
            Administration Date
          </label>
          <input
            type="date"
            id="administrationDate"
            name="administrationDate"
            value={administrationDate}
            onChange={(e) => setAdministrationDate(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-xl font-medium text-gray-700">
            Frequency
          </label>
          <input
            type="text"
            id="frequency"
            name="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
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
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] rounded-md hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Deworming' : 'Save Deworming'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DewormingForm;