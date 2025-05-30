import { SurgicalProcedure } from '@/utilities/MedicalRecord';
import React, { useState } from 'react';

interface SurgicalProcedureFormProps {
  initialData?: SurgicalProcedure;
  onSubmit: (procedure: SurgicalProcedure) => void;
  onCancel: () => void;
  petId: string;
  surgeryId?: string; // Optional ID for editing
}

const SurgicalProcedureForm: React.FC<SurgicalProcedureFormProps> = ({ 
  initialData = { date: '', type: '', id: '' },
  onSubmit, 
  onCancel,
  surgeryId
}) => {
  const [type, setType] = useState(initialData.type || '');
  const [date, setDate] = useState(initialData.date || '');
  const [complications, setComplications] = useState(initialData.complications || '');
  const [medicationPostoperative, setMedicationPostoperative] = useState(initialData.medicationPostoperative || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're editing an existing procedure or adding a new one
  const isEditing = initialData && (initialData.date !== '' || !!surgeryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!date) {
      setError("Date is required");
      return;
    }
    
    if (!type) {
      setError("Procedure type is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a complete procedure object
      const procedureData: SurgicalProcedure = {
        id: surgeryId || '',
        date,
        type,
        complications: complications || undefined,
        medicationPostoperative: medicationPostoperative || undefined,
      };
      
      console.log("Surgical procedure data to submit:", procedureData);
      
      // Call the onSubmit function to let parent component handle the API call
      onSubmit(procedureData);
      // Don't close the form here - let the parent component decide when to close it
    } catch (err) {
      console.error("Error processing surgical procedure:", err);
      setError(err instanceof Error ? err.message : "Failed to process surgical procedure");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Surgical Procedure' : 'Add Surgical Procedure'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
<div>
          <label htmlFor="type" className="block text-xl font-medium text-gray-700">
            Procedure Type *
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            placeholder="e.g., Spay/Neuter, Dental Surgery, Tumor Removal"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-xl font-medium text-gray-700">
            Procedure Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        </div>
        

        <div>
          <label htmlFor="complications" className="block text-xl font-medium text-gray-700">
            Complications
          </label>
          <textarea
            id="complications"
            name="complications"
            value={complications}
            onChange={(e) => setComplications(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            rows={2}
            placeholder="Any complications during or after surgery"
          ></textarea>
        </div>

        <div>
          <label htmlFor="medicationPostoperative" className="block text-xl font-medium text-gray-700">
            Post-operative Medication
          </label>
          <textarea
            id="medicationPostoperative"
            name="medicationPostoperative"
            value={medicationPostoperative}
            onChange={(e) => setMedicationPostoperative(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            rows={2}
            placeholder="Medications and instructions after surgery"
          ></textarea>
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Procedure' : 'Save Procedure'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurgicalProcedureForm;