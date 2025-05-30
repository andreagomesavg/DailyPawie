import { Allergy } from '@/utilities/MedicalRecord';
import React, { useState } from 'react';

interface AllergyFormProps {
  initialData?: Allergy;
  onSubmit: (allergy: Allergy) => void;
  onCancel: () => void;
  petId: string;
  allergyId?: string;
}

const AllergyForm: React.FC<AllergyFormProps> = ({ 
  initialData = { allergie: '', id: '' },
  onSubmit, 
  onCancel,
  allergyId
}) => {
  const [allergie, setAllergie] = useState(initialData.allergie || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're editing an existing allergy or adding a new one
  const isEditing = initialData && (initialData.allergie !== '' || !!allergyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!allergie) {
      setError("Allergy name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a complete allergy object
      const allergyData: Allergy = {
        id: allergyId || '',
        allergie,
        description: description || undefined,
      };
      
      console.log("Allergy data to submit:", allergyData);
      
      // Call the onSubmit function to let parent component handle the API call
      onSubmit(allergyData);
      // Don't close the form here - let the parent component decide when to close it
    } catch (err) {
      console.error("Error processing allergy:", err);
      setError(err instanceof Error ? err.message : "Failed to process allergy");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Allergy' : 'Add Allergy'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='grid grid-cols-2 gap-4'>
  <div>
          <label htmlFor="allergie" className="block text-xl font-medium text-gray-700">
            Allergy *
          </label>
          <input
            type="text"
            id="allergie"
            name="allergie"
            value={allergie}
            onChange={(e) => setAllergie(e.target.value)}
            required
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="e.g., Chicken, Pollen, Medication"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xl font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Describe symptoms, severity, and any other relevant details"
          ></textarea>
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Allergy' : 'Save Allergy'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllergyForm;