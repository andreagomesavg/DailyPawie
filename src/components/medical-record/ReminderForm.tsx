"use client"
import React, { useState } from 'react';
import PetService from '@/utilities/PetService';

interface Reminder {
  id?: string;
  type: string;
  date: string;
  time?: string;
  description?: string;
}

interface ReminderFormProps {
  initialData?: Reminder;
  onSubmit: (reminder: Reminder) => void;
  onCancel: () => void;
  petId: string;
  reminderId?: string;
}

const ReminderForm: React.FC<ReminderFormProps> = ({
  initialData = { type: '', date: '', id: '' },
  onSubmit,
  onCancel,
  petId,
  reminderId
}) => {
  const [formData, setFormData] = useState<Reminder>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Determine if we're editing an existing reminder or adding a new one
  const isEditing = !!reminderId || (initialData && initialData.date !== '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.date || !formData.type) {
      setError("Please fill out all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setStatus("Processing reminder...");

    try {
      // Create a complete reminder object
      const reminderData: Reminder = {
        id: reminderId || formData.id || '',
        type: formData.type,
        date: formData.date,
        time: formData.time || undefined,
        description: formData.description || undefined,
      };
      
      console.log("Reminder data to submit:", reminderData);
      
      // Use the appropriate PetService method based on whether we're adding or editing
      if (isEditing && reminderId) {
        setStatus("Updating existing reminder...");
        await PetService.updateReminder(petId, reminderId, reminderData);
      } else {
        setStatus("Adding new reminder...");
        await PetService.addReminder(petId, reminderData);
      }
      
      setStatus(isEditing ? "Reminder updated successfully!" : "Reminder added successfully!");
      
      // Call the onSubmit function to update the parent component
      onSubmit(reminderData);
      
    } catch (err) {
      console.error("Error processing reminder:", err);
      setError(err instanceof Error ? err.message : "Failed to process reminder");
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="mb-4 text-[#001e4c] pt-2  font-bold leading-none text-left 
          text-[38px] tracking-tight">
        {isEditing ? 'Edit Reminder' : 'Add Reminder'}
      </h3>
      
      {/* Status Information */}
      {status && (
        <div className="p-3 mb-4 text-lg bg-gray-100 border border-gray-300 rounded">
          <strong>Status:</strong> {status}
        </div>
      )}
      
      {error && (
        <div className="p-3 mb-4 text-lg text-red-700 bg-red-100 border border-red-300 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='max-w-[1200px] mx-auto'>
        <div className="mb-4 ">
          <label htmlFor="reminderType" className="block mb-1 text-lg font-medium text-gray-700 ">
            Type <span className="text-red-500 text-left">*</span>
          </label>
          <select
            id="reminderType"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="box-border block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            required
            disabled={isSubmitting}
          >
            <option value="">Select type</option>
            <option value="vaccine">Vaccine</option>
            <option value="deworming">Deworming</option>
            <option value="vetAppointment">Vet Appointment</option>
            <option value="medication">Medication</option>
            <option value="haircut">Haircut</option>
            <option value="bath">Bath</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className='box-border grid gird-cols-1 md:grid-cols-2 gap-4'>
  <div className="mb-4">
          <label htmlFor="date" className="block mb-1 text-lg font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="box-border block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="time" className="block mb-1 text-lg font-medium text-gray-700">
            Time (optional)
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time || ''}
            onChange={handleInputChange}
            className="box-border block  w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            disabled={isSubmitting}
          />
        </div>
        </div>
      
        
        <div className="mb-4">
          <label htmlFor="description" className="block mb-1 text-lg font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            className="box-border block  w-full
             px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
            rows={3}
            disabled={isSubmitting}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3 mt-2 ">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-lg font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md hover:bg-gray-300 hover:cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-lg font-medium text-white bg-[#3479ba] border border-transparent rounded-md hover:bg-[#3479ba] hover:cursor-pointer disabled:bg-blue-400 hover:opacity-80"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;