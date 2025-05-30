import { SurgicalProcedure } from "@/utilities/MedicalRecord";
import React, { useState, useEffect } from "react";
import SurgicalProcedureForm from "./SurgicalProcedureForm";
import EmptyState from "./Empty-State";
import { formatDate } from "@/utilities/dateFormatter";
import PetService from "@/utilities/PetService";

interface SurgicalProceduresComponentProps {
  procedures: SurgicalProcedure[];
  isOwner: boolean;
  onUpdate: (procedures: SurgicalProcedure[]) => void;
  petId: string;
}

const SurgicalProceduresComponent: React.FC<SurgicalProceduresComponentProps> = ({
  procedures,
  isOwner,
  onUpdate,
  petId
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<{ data: SurgicalProcedure; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localProcedures, setLocalProcedures] = useState<SurgicalProcedure[]>(procedures);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Effect to update local state when props change
  useEffect(() => {
    if (!isRefreshing) {
      setLocalProcedures(procedures);
    }
  }, [procedures, isRefreshing]);
  
  // Function to refresh procedures data from the server
  const refreshProcedures = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh pet data to get updated procedures
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedProcedures = petData.medicalRecord?.surgicalProcedures || [];
      console.log("Updated procedures from refresh:", updatedProcedures);
      
      // Update local state immediately for better UI responsiveness
      setLocalProcedures(updatedProcedures);
      
      // Update parent component with fresh data
      onUpdate(updatedProcedures);
      return updatedProcedures;
    } catch (err) {
      console.error("Error refreshing procedures data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh procedures data");
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
  
  // Helper function to deduplicate procedures
  const deduplicateProcedures = (procedures: SurgicalProcedure[]): SurgicalProcedure[] => {
    const uniqueProcedures: SurgicalProcedure[] = [];
    const seen = new Set<string>();
    
    for (const procedure of procedures) {
      // Create a key from the procedure's unique fields
      const key = `${procedure.date}-${procedure.type}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueProcedures.push(procedure);
      }
    }
    
    return uniqueProcedures;
  };
  
  // Function to handle adding a new surgical procedure
  const handleAddProcedure = async (newProcedure: SurgicalProcedure) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding surgical procedure:", newProcedure);
      
      // Add to local state optimistically to improve UI responsiveness
      const optimisticProcedure = { 
        ...newProcedure, 
        id: `optimistic-${Date.now()}` 
      };
      setLocalProcedures(prev => deduplicateProcedures([...prev, optimisticProcedure]));
      
      // Call API to add the procedure
      const result = await PetService.addSurgicalProcedure(petId, newProcedure);
      console.log("Add procedure result:", result); // Fixed: Now actually using the result
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh procedures data from server
      await refreshProcedures();
      
      // Show success message
      showSuccessMessage("Surgical procedure added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding surgical procedure:", err);
      setError(err instanceof Error ? err.message : "Failed to add surgical procedure");
      
      // Even if there was an error, still refresh to see if the procedure was actually added
      await refreshProcedures();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle updating an existing surgical procedure
  const handleUpdateProcedure = async (updatedProcedure: SurgicalProcedure) => {
    if (!editingProcedure) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original procedure:", editingProcedure.data);
      console.log("Updated procedure to send:", updatedProcedure);
      
      // Update local state optimistically
      setLocalProcedures(prev => {
        const updated = [...prev];
        const index = updated.findIndex(p => String(p.id) === String(editingProcedure.id));
        if (index !== -1) {
          updated[index] = { ...updatedProcedure, id: editingProcedure.id };
        }
        return updated;
      });
      
      // Make sure we preserve the ID
      updatedProcedure.id = editingProcedure.id;
      
      // Call API to update the procedure
      await PetService.updateSurgicalProcedure(petId, editingProcedure.id, updatedProcedure);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh procedures data from server
      await refreshProcedures();
      
      // Show success message
      showSuccessMessage("Surgical procedure updated successfully!");
      
      // Reset editing state
      setEditingProcedure(null);
    } catch (err) {
      console.error("Error updating surgical procedure:", err);
      setError(err instanceof Error ? err.message : "Failed to update surgical procedure");
      
      // Even if there was an error, still refresh to see the current state
      await refreshProcedures();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle deleting a surgical procedure
  const handleDeleteProcedure = async (procedureId: string) => {
    if (!confirm("Are you sure you want to delete this surgical procedure?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update local state optimistically
      setLocalProcedures(prev => prev.filter(p => String(p.id) !== String(procedureId)));
      
      // Use the PetService to delete the procedure
      await PetService.deleteSurgicalProcedure(petId, procedureId);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh procedures data from server
      await refreshProcedures();
      
      // Show success message
      showSuccessMessage("Surgical procedure deleted successfully!");
    } catch (err) {
      console.error("Error deleting surgical procedure:", err);
      setError(err instanceof Error ? err.message : "Failed to delete surgical procedure");
      
      // Even if there was an error, still refresh to see the current state
      await refreshProcedures();
    } finally {
      setLoading(false);
    }
  };
  
  // If we're showing the add form
  if (formVisible) {
    return (
      <SurgicalProcedureForm 
        onSubmit={handleAddProcedure} 
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }
  
  // If we're showing the edit form
  if (editingProcedure) {
    return (
      <SurgicalProcedureForm
        initialData={editingProcedure.data}
        onSubmit={handleUpdateProcedure}
        onCancel={() => setEditingProcedure(null)}
        petId={petId}
        surgeryId={editingProcedure.id}
      />
    );
  }
  
  // Deduplicate procedures for display
  const displayProcedures = deduplicateProcedures(localProcedures);
  
  if (displayProcedures.length === 0) {
    return (
      <EmptyState 
        category="surgical procedure" 
        isOwner={isOwner} 
        onAddClick={() => setFormVisible(true)} 
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Surgical Procedures</h3>
        <div className="flex space-x-2">
          {isOwner && (
            <button
              onClick={() => setFormVisible(true)}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Add Procedure'}
            </button>
          )}
          <button
            onClick={() => refreshProcedures()}
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
          {displayProcedures.map((procedure) => (
            <li key={procedure.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900">
                    {procedure.type} - {formatDate(procedure.date)}
                  </p>
                  <div className="mt-2 space-y-2">
                    {procedure.complications && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Complications:</span> {procedure.complications}
                      </p>
                    )}
                    {procedure.medicationPostoperative && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Post-operative Medication:</span> {procedure.medicationPostoperative}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProcedure({ data: procedure, id: procedure.id || '' })}
                      disabled={loading || !procedure.id || procedure.id.startsWith('optimistic-')}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => procedure.id && handleDeleteProcedure(procedure.id)}
                      disabled={loading || !procedure.id || procedure.id.startsWith('optimistic-')}
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

export default SurgicalProceduresComponent;