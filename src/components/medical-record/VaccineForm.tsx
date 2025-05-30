import React, { useState } from 'react';
import { Vaccine } from '@/utilities/MedicalRecord';

interface VaccineFormProps {
  initialData?: Vaccine;
  onSubmit: (vaccine: Vaccine) => void;
  onCancel: () => void;
  petId: string;
  vaccineId?: string; // Optional index for editing
}

const VaccineForm: React.FC<VaccineFormProps> = ({
  initialData = { vaccineType: '', administrationDate: '', nextDosis: '', lotNumber: '', id: '' },
  onSubmit,
  onCancel,
  vaccineId
}) => {
  const [vaccineType, setVaccineType] = useState(initialData.vaccineType || '');
  const [administrationDate, setAdministrationDate] = useState(initialData.administrationDate || '');
  const [nextDosis, setNextDosis] = useState(initialData.nextDosis || '');
  const [lotNumber, setLotNumber] = useState(initialData.lotNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're editing an existing vaccine or adding a new one
  const isEditing = initialData && initialData.vaccineType !== '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!vaccineType) {
      setError('Vaccine type is required');
      setIsSubmitting(false);
      return;
    }

    // Create the vaccine data object with ALL fields
    const vaccineData: Vaccine = {
      id: vaccineId || "",
      vaccineType,
      administrationDate,
      nextDosis,
      lotNumber,
    };

    console.log("Submitting vaccine form with data:", vaccineData);

    try {
      // Call the onSubmit function to let parent component handle the API call
      onSubmit(vaccineData);
      // Don't close the form here - let the parent component decide when to close it
    } catch (err) {
      console.error("Error processing vaccine:", err);
      setError(err instanceof Error ? err.message : "Failed to process vaccine");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Vaccine' : 'Add Vaccine'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="vaccineType" className="block text-xl font-medium text-gray-700">
            Vaccine Type *
          </label>
          <input
            type="text"
            id="vaccineType"
            name="vaccineType"
            value={vaccineType}
            onChange={(e) => setVaccineType(e.target.value)}
            required
            className="box-border  block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            autoComplete="off"
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
          <label htmlFor="nextDosis" className="block text-xl font-medium text-gray-700">
            Next Dose
          </label>
          <input
            type="date"
            id="nextDosis"
            name="nextDosis"
            value={nextDosis}
            onChange={(e) => setNextDosis(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>

        </div>

      
        <div>
          <label htmlFor="lotNumber" className="block text-xl font-medium text-gray-700">
            Lot Number
          </label>
          <input
            type="text"
            id="lotNumber"
            name="lotNumber"
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
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
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] rounded-md hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Vaccine' : 'Save Vaccine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VaccineForm;