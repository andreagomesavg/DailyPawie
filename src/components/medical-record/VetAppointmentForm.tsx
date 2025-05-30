import { VetAppointment } from '@/utilities/MedicalRecord';
import React, { useState } from 'react';
import PetService from '@/utilities/PetService';

interface VetAppointmentFormProps {
  initialData?: VetAppointment;
  onSubmit: (appointment: VetAppointment) => void;
  onCancel: () => void;
  petId: string; // Added petId for API calls
  appointmentId?: string; // Optional ID for editing
}

const VetAppointmentForm: React.FC<VetAppointmentFormProps> = ({ 
  initialData = { date: '', id: '' },
  onSubmit, 
  onCancel,
  petId,
  appointmentId
}) => {
  const [formData, setFormData] = useState<VetAppointment>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Determine if we're editing an existing appointment or adding a new one
  const isEditing = initialData && (initialData.date !== '' || !!appointmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.date) {
      setError("Date is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setStatus("Processing appointment...");

    try {
      // Create a complete appointment object
      const appointmentData: VetAppointment = {
        id: appointmentId || formData.id || '',
        date: formData.date,
        reason: formData.reason || undefined,
        diagnostic: formData.diagnostic || undefined,
        treatment: formData.treatment || undefined,
      };
      
      console.log("Appointment data to submit:", appointmentData);
      
      // Use the appropriate PetService method based on whether we're adding or editing
      if (isEditing && appointmentId) {
        setStatus("Updating existing appointment...");
        await PetService.updateVetAppointment(petId, appointmentId, appointmentData);
      } else {
        setStatus("Adding new appointment...");
        await PetService.addVetAppointment(petId, appointmentData);
      }
      
      setStatus(isEditing ? "Appointment updated successfully!" : "Appointment added successfully!");
      
      // Call the onSubmit function to update the parent component
      onSubmit(appointmentData);
      
    } catch (err) {
      console.error("Error processing appointment:", err);
      setError(err instanceof Error ? err.message : "Failed to process appointment");
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Veterinary Appointment' : 'Add Veterinary Appointment'}
      </h3>
      
      {/* Status/Debug Information */}
      {status && (
        <div className="p-3 mb-4 text-xl bg-gray-100 border border-gray-300 rounded">
          <strong>Status:</strong> {status}
        </div>
      )}
      
      {error && (
        <div className="p-3 mb-4 text-xl text-red-700 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-xl font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="box-border w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-xl font-medium text-gray-700">
            Reason for Visit
          </label>
          <textarea
            value={formData.reason || ''}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            className="box-border w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            rows={3}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-xl font-medium text-gray-700">
            Diagnosis
          </label>
          <textarea
            value={formData.diagnostic || ''}
            onChange={(e) => setFormData({...formData, diagnostic: e.target.value})}
            className="box-border w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            rows={3}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-xl font-medium text-gray-700">
            Treatment Plan
          </label>
          <textarea
            value={formData.treatment || ''}
            onChange={(e) => setFormData({...formData, treatment: e.target.value})}
            className="box-border w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            rows={3}
            disabled={isSubmitting}
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md hover:bg-[#3479ba] disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VetAppointmentForm;