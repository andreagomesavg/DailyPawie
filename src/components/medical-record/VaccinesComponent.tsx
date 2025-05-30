import React, { useState } from 'react';
import { formatDate } from '@/utilities/dateFormatter';
import { Vaccine } from '@/utilities/MedicalRecord';
import VaccineForm from './VaccineForm';
import EmptyState from './Empty-State';
import PetService from '@/utilities/PetService';

interface VaccinesComponentProps {
  vaccines: Vaccine[];
  isOwner: boolean;
  onUpdate: (vaccines: Vaccine[]) => void;
  petId: string;
}

const VaccinesComponent: React.FC<VaccinesComponentProps> = ({
  vaccines,
  isOwner,
  onUpdate,
  petId
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<{ data: Vaccine; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to refresh vaccines from the server
  const refreshVaccines = async () => {
    try {
      // Fetch fresh pet data to get updated vaccines
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedVaccines = petData.medicalRecord?.vaccines || [];
      console.log("Updated vaccines from refresh:", updatedVaccines);
      
      // Update parent component with fresh data
      onUpdate(updatedVaccines);
      return updatedVaccines;
    } catch (err) {
      console.error("Error refreshing vaccines:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh vaccines");
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

  // Function to handle adding a new vaccine
  const handleAddVaccine = async (newVaccine: Vaccine) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding new vaccine:", newVaccine);
      
      // Call API to add the vaccine
      await PetService.addVaccine(petId, newVaccine);
      
      // Refresh vaccines from server
      const refreshedVaccines = await refreshVaccines();
      console.log("Refreshed vaccines after add:", refreshedVaccines);
      
      // Show success message
      showSuccessMessage("Vaccine added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding vaccine:", err);
      setError(err instanceof Error ? err.message : "Failed to add vaccine");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating an existing vaccine
  const handleUpdateVaccine = async (updatedVaccine: Vaccine) => {
    if (!editingVaccine) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original vaccine:", editingVaccine.data);
      console.log("Updated vaccine to send:", updatedVaccine);
      
      // Make sure we preserve the ID
      updatedVaccine.id = editingVaccine.id;
      
      // Call API to update the vaccine
      await PetService.updateVaccine(petId, editingVaccine.id, updatedVaccine);
      
      // Refresh vaccines from server
      const refreshedVaccines = await refreshVaccines();
      console.log("Received refreshed vaccines:", refreshedVaccines);
      
      // Show success message
      showSuccessMessage("Vaccine updated successfully!");
      
      // Reset editing state
      setEditingVaccine(null);
    } catch (err) {
      console.error("Error updating vaccine:", err);
      setError(err instanceof Error ? err.message : "Failed to update vaccine");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a vaccine
  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!confirm("Are you sure you want to delete this vaccine record?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the PetService to delete the vaccine
      await PetService.deleteVaccine(petId, vaccineId);
      
      // Refresh vaccines from server
      await refreshVaccines();
      
      // Show success message
      showSuccessMessage("Vaccine deleted successfully!");
    } catch (err) {
      console.error("Error deleting vaccine:", err);
      setError(err instanceof Error ? err.message : "Failed to delete vaccine");
    } finally {
      setLoading(false);
    }
  };

  // If we're showing the add form
  if (formVisible) {
    return (
      <VaccineForm
        onSubmit={handleAddVaccine}
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }

  // If we're showing the edit form
  if (editingVaccine) {
    return (
      <VaccineForm
        initialData={editingVaccine.data}
        onSubmit={handleUpdateVaccine}
        onCancel={() => setEditingVaccine(null)}
        petId={petId}
        vaccineId={editingVaccine.id}
      />
    );
  }

  if (vaccines.length === 0) {
    return (
      <EmptyState
        category="vaccine"
        isOwner={isOwner}
        onAddClick={() => setFormVisible(true)}
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Vaccines</h3>
        {isOwner && (
          <button
            onClick={() => setFormVisible(true)}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {loading ? 'Loading...' : 'Add Vaccine'}
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
          {vaccines.map((vaccine) => (
            <li key={vaccine.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900 truncate">{vaccine.vaccineType}</p>
                  <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                    <p className="text-xl text-gray-500">
                      <span className="font-medium">Date:</span> {formatDate(vaccine.administrationDate)}
                    </p>
                    {vaccine.nextDosis && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Next dose:</span> {formatDate(vaccine.nextDosis)}
                      </p>
                    )}
                    {vaccine.lotNumber && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Lot number:</span> {vaccine.lotNumber}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingVaccine({ data: vaccine, id: vaccine.id || '' })}
                      disabled={loading || !vaccine.id}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => vaccine.id && handleDeleteVaccine(vaccine.id)}
                      disabled={loading || !vaccine.id}
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

export default VaccinesComponent;