import React, { useState, useEffect } from 'react';
import { formatDate } from '@/utilities/dateFormatter';
import { Deworming } from '@/utilities/MedicalRecord';
import DewormingForm from './DewormingForm';
import EmptyState from './Empty-State';
import PetService from '@/utilities/PetService';

interface DewormingComponentProps {
  deworming: Deworming[];
  isOwner: boolean;
  onUpdate: (deworming: Deworming[]) => void;
  petId: string;
}

const DewormingComponent: React.FC<DewormingComponentProps> = ({
  deworming,
  isOwner,
  onUpdate,
  petId
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingDeworming, setEditingDeworming] = useState<{ data: Deworming; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localDeworming, setLocalDeworming] = useState<Deworming[]>(deworming);

  // Effect to update local state when props change
  useEffect(() => {
    setLocalDeworming(deworming);
  }, [deworming]);

  // Function to refresh deworming data from the server
  const refreshDeworming = async () => {
    try {
      // Fetch fresh pet data to get updated deworming records
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedDeworming = petData.medicalRecord?.deworming || [];
      console.log("Updated deworming from refresh:", updatedDeworming);
      
      // Update local state immediately for better UI responsiveness
      setLocalDeworming(updatedDeworming);
      
      // Update parent component with fresh data
      onUpdate(updatedDeworming);
      return updatedDeworming;
    } catch (err) {
      console.error("Error refreshing deworming:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh deworming");
      return null;
    }
  };

  // Helper function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Function to handle adding a new deworming treatment
  const handleAddDeworming = async (newDeworming: Deworming) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding new deworming treatment:", newDeworming);
      
      // Call API to add the deworming treatment
      await PetService.addDeworming(petId, newDeworming);
      
      // Refresh deworming data from server
      const refreshedDeworming = await refreshDeworming();
      console.log("Refreshed deworming after add:", refreshedDeworming);
      
      // Show success message
      showSuccessMessage("Deworming treatment added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding deworming:", err);
      setError(err instanceof Error ? err.message : "Failed to add deworming treatment");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating an existing deworming treatment
  const handleUpdateDeworming = async (updatedDeworming: Deworming) => {
    if (!editingDeworming) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original deworming:", editingDeworming.data);
      console.log("Updated deworming to send:", updatedDeworming);
      
      // Make sure we preserve the ID
      updatedDeworming.id = editingDeworming.id;
      
      // Call API to update the deworming
      await PetService.updateDeworming(petId, editingDeworming.id, updatedDeworming);
      
      // Refresh deworming data from server
      const refreshedDeworming = await refreshDeworming();
      console.log("Received refreshed deworming:", refreshedDeworming);
      
      // Show success message
      showSuccessMessage("Deworming treatment updated successfully!");
      
      // Reset editing state
      setEditingDeworming(null);
    } catch (err) {
      console.error("Error updating deworming:", err);
      setError(err instanceof Error ? err.message : "Failed to update deworming treatment");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a deworming treatment
  const handleDeleteDeworming = async (dewormingId: string) => {
    if (!confirm("Are you sure you want to delete this deworming record?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the PetService to delete the deworming
      await PetService.deleteDeworming(petId, dewormingId);
      
      // Refresh deworming data from server
      await refreshDeworming();
      
      // Show success message
      showSuccessMessage("Deworming treatment deleted successfully!");
    } catch (err) {
      console.error("Error deleting deworming:", err);
      setError(err instanceof Error ? err.message : "Failed to delete deworming treatment");
    } finally {
      setLoading(false);
    }
  };

  // If we're showing the add form
  if (formVisible) {
    return (
      <DewormingForm
        onSubmit={handleAddDeworming}
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }

  // If we're showing the edit form
  if (editingDeworming) {
    return (
      <DewormingForm
        initialData={editingDeworming.data}
        onSubmit={handleUpdateDeworming}
        onCancel={() => setEditingDeworming(null)}
        petId={petId}
        dewormingId={editingDeworming.id}
      />
    );
  }

  if (localDeworming.length === 0) {
    return (
      <EmptyState
        category="deworming"
        isOwner={isOwner}
        onAddClick={() => setFormVisible(true)}
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Deworming Treatments</h3>
        {isOwner && (
          <button
            onClick={() => setFormVisible(true)}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {loading ? 'Loading...' : 'Add Deworming'}
          </button>
        )}
      </div>
      
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
      
      <div className="border-t border-gray-200">
        <ul className="pl-0 ml-0 list-none divide-y divide-gray-200">
          {localDeworming.map((treatment) => (
            <li key={treatment.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900 truncate">
                    {treatment.type === 'internal' ? 'Internal' : 
                     treatment.type === 'external' ? 'External' : 
                     treatment.type}
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                    {treatment.antiparasitic && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Antiparasitic:</span> {treatment.antiparasitic}
                      </p>
                    )}
                    {treatment.administrationDate && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Date:</span> {formatDate(treatment.administrationDate)}
                      </p>
                    )}
                    {treatment.frequency && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Frequency:</span> {treatment.frequency}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingDeworming({ data: treatment, id: treatment.id || '' })}
                      disabled={loading || !treatment.id}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => treatment.id && handleDeleteDeworming(treatment.id)}
                      disabled={loading || !treatment.id}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DewormingComponent;