import { Allergy } from "@/utilities/MedicalRecord";
import React, { useState, useEffect } from "react";
import AllergyForm from "./AllergyForm";
import EmptyState from "./Empty-State";
import PetService from "@/utilities/PetService";

interface AllergiesComponentProps {
  allergies: Allergy[];
  isOwner: boolean;
  onUpdate: (allergies: Allergy[]) => void;
  petId: string;
}

const AllergiesComponent: React.FC<AllergiesComponentProps> = ({
  allergies,
  isOwner,
  onUpdate,
  petId
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<{ data: Allergy; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localAllergies, setLocalAllergies] = useState<Allergy[]>(allergies);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Effect to update local state when props change
  useEffect(() => {
    if (!isRefreshing) {
      setLocalAllergies(allergies);
    }
  }, [allergies, isRefreshing]);
  
  // Function to refresh allergies data from the server
  const refreshAllergies = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh pet data to get updated allergies
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedAllergies = petData.medicalRecord?.allergies || [];
      console.log("Updated allergies from refresh:", updatedAllergies);
      
      // Update local state immediately for better UI responsiveness
      setLocalAllergies(updatedAllergies);
      
      // Update parent component with fresh data
      onUpdate(updatedAllergies);
      return updatedAllergies;
    } catch (err) {
      console.error("Error refreshing allergies data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh allergies data");
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Helper function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  // Helper function to deduplicate allergies
  const deduplicateAllergies = (allergies: Allergy[]): Allergy[] => {
    const uniqueAllergies: Allergy[] = [];
    const seen = new Set<string>();
    
    for (const allergy of allergies) {
      // Create a key from the allergy's unique field
      const key = allergy.allergie;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAllergies.push(allergy);
      }
    }
    
    return uniqueAllergies;
  };
  
  // Function to handle adding a new allergy
  const handleAddAllergy = async (newAllergy: Allergy) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding allergy:", newAllergy);
      
      // First check if this allergy already exists to prevent duplicates
      const isDuplicate = localAllergies.some(
        allergy => allergy.allergie === newAllergy.allergie
      );
      
      if (isDuplicate) {
        setError("This allergy already exists");
        setLoading(false);
        return;
      }
      
      // Add to local state optimistically to improve UI responsiveness
      const optimisticAllergy = { 
        ...newAllergy, 
        id: `optimistic-${Date.now()}` 
      };
      
      setLocalAllergies(prev => {
        const updated = [...prev, optimisticAllergy];
        return deduplicateAllergies(updated);
      });
      
      // Call API to add the allergy
      await PetService.addAllergy(petId, newAllergy);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh allergies data from server
      await refreshAllergies();
      
      // Show success message
      showSuccessMessage("Allergy added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding allergy:", err);
      setError(err instanceof Error ? err.message : "Failed to add allergy");
      
      // Even if there was an error, still refresh to see if the allergy was actually added
      await refreshAllergies();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle updating an existing allergy
  const handleUpdateAllergy = async (updatedAllergy: Allergy) => {
    if (!editingAllergy) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original allergy:", editingAllergy.data);
      console.log("Updated allergy to send:", updatedAllergy);
      
      // Update local state optimistically
      setLocalAllergies(prev => {
        const updated = [...prev];
        const index = updated.findIndex(a => String(a.id) === String(editingAllergy.id));
        if (index !== -1) {
          updated[index] = { ...updatedAllergy, id: editingAllergy.id };
        }
        return updated;
      });
      
      // Make sure we preserve the ID
      updatedAllergy.id = editingAllergy.id;
      
      // Call API to update the allergy
      await PetService.updateAllergy(petId, editingAllergy.id, updatedAllergy);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh allergies data from server
      await refreshAllergies();
      
      // Show success message
      showSuccessMessage("Allergy updated successfully!");
      
      // Reset editing state
      setEditingAllergy(null);
    } catch (err) {
      console.error("Error updating allergy:", err);
      setError(err instanceof Error ? err.message : "Failed to update allergy");
      
      // Even if there was an error, still refresh to see the current state
      await refreshAllergies();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle deleting an allergy
  const handleDeleteAllergy = async (allergyId: string) => {
    if (!confirm("Are you sure you want to delete this allergy?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update local state optimistically
      setLocalAllergies(prev => prev.filter(a => String(a.id) !== String(allergyId)));
      
      // Use the PetService to delete the allergy
      await PetService.deleteAllergy(petId, allergyId);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh allergies data from server
      await refreshAllergies();
      
      // Show success message
      showSuccessMessage("Allergy deleted successfully!");
    } catch (err) {
      console.error("Error deleting allergy:", err);
      setError(err instanceof Error ? err.message : "Failed to delete allergy");
      
      // Even if there was an error, still refresh to see the current state
      await refreshAllergies();
    } finally {
      setLoading(false);
    }
  };
  
  // If we're showing the add form
  if (formVisible) {
    return (
      <AllergyForm 
        onSubmit={handleAddAllergy} 
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }
  
  // If we're showing the edit form
  if (editingAllergy) {
    return (
      <AllergyForm
        initialData={editingAllergy.data}
        onSubmit={handleUpdateAllergy}
        onCancel={() => setEditingAllergy(null)}
        petId={petId}
        allergyId={editingAllergy.id}
      />
    );
  }
  
  // Deduplicate allergies for display
  const displayAllergies = deduplicateAllergies(localAllergies);
  
  if (displayAllergies.length === 0) {
    return (
      <EmptyState 
        category="allergy" 
        isOwner={isOwner} 
        onAddClick={() => setFormVisible(true)} 
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Allergies</h3>
        <div className="flex space-x-2">
          {isOwner && (
            <button
              onClick={() => setFormVisible(true)}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Add Allergy'}
            </button>
          )}
          <button
            onClick={() => refreshAllergies()}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
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
      
      {loading && (
        <div className="px-4 py-2 mb-4 text-xl text-blue-700 bg-blue-100 border-l-4 border-blue-500">
          Processing your request...
        </div>
      )}
      
      <div className="border-t border-gray-200">
        <ul className="pl-0 ml-0 list-none divide-y divide-gray-200">
          {displayAllergies.map((allergy) => (
            <li key={allergy.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900">
                    {allergy.allergie}
                  </p>
                  {allergy.description && (
                    <p className="mt-1 text-xl text-gray-500">
                      {allergy.description}
                    </p>
                  )}
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAllergy({ data: allergy, id: allergy.id || '' })}
                      disabled={loading || !allergy.id || allergy.id.startsWith('optimistic-')}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => allergy.id && handleDeleteAllergy(allergy.id)}
                      disabled={loading || !allergy.id || allergy.id.startsWith('optimistic-')}
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

export default AllergiesComponent;