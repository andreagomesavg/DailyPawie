import { VetAppointment } from "@/utilities/MedicalRecord";
import React, { useState, useEffect } from "react";
import VetAppointmentForm from "./VetAppointmentForm";
import EmptyState from "./Empty-State";
import { formatDate } from "@/utilities/dateFormatter";
import PetService from "@/utilities/PetService";

interface VetAppointmentsComponentProps {
  appointments: VetAppointment[];
  isOwner: boolean;
  onUpdate: (appointments: VetAppointment[]) => void;
  petId: string;
}

const VetAppointmentsComponent: React.FC<VetAppointmentsComponentProps> = ({
  appointments,
  isOwner,
  onUpdate,
  petId
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<{ data: VetAppointment; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localAppointments, setLocalAppointments] = useState<VetAppointment[]>(appointments);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Effect to update local state when props change
  useEffect(() => {
    if (!isRefreshing) {
      setLocalAppointments(appointments);
    }
  }, [appointments, isRefreshing]);
  
  // Function to refresh appointments data from the server
  const refreshAppointments = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh pet data to get updated appointments
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedAppointments = petData.medicalRecord?.vetAppointments || [];
      console.log("Updated appointments from refresh:", updatedAppointments);
      
      // Update local state immediately for better UI responsiveness
      setLocalAppointments(updatedAppointments);
      
      // Update parent component with fresh data
      onUpdate(updatedAppointments);
      return updatedAppointments;
    } catch (err) {
      console.error("Error refreshing appointments data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh appointments data");
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
  
  // Helper function to deduplicate appointments
  const deduplicateAppointments = (appointments: VetAppointment[]): VetAppointment[] => {
    const uniqueAppointments: VetAppointment[] = [];
    const seen = new Set<string>();
    
    for (const appointment of appointments) {
      // Create a key from the appointment's unique fields
      const key = `${appointment.date}-${appointment.reason || ''}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueAppointments.push(appointment);
      }
    }
    
    return uniqueAppointments;
  };
  
  // Function to handle adding a new appointment
  const handleAddAppointment = async (newAppointment: VetAppointment) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding appointment:", newAppointment);
      
      // Add to local state optimistically to improve UI responsiveness
      const optimisticAppointment = { 
        ...newAppointment, 
        id: `optimistic-${Date.now()}` 
      };
      setLocalAppointments(prev => deduplicateAppointments([...prev, optimisticAppointment]));
      
      // Call API to add the appointment
      await PetService.addVetAppointment(petId, newAppointment);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh appointments data from server
      await refreshAppointments();
      
      // Show success message
      showSuccessMessage("Appointment added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding appointment:", err);
      setError(err instanceof Error ? err.message : "Failed to add appointment");
      
      // Even if there was an error, still refresh to see if the appointment was actually added
      await refreshAppointments();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle updating an existing appointment
  const handleUpdateAppointment = async (updatedAppointment: VetAppointment) => {
    if (!editingAppointment) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original appointment:", editingAppointment.data);
      console.log("Updated appointment to send:", updatedAppointment);
      
      // Update local state optimistically
      setLocalAppointments(prev => {
        const updated = [...prev];
        const index = updated.findIndex(a => String(a.id) === String(editingAppointment.id));
        if (index !== -1) {
          updated[index] = { ...updatedAppointment, id: editingAppointment.id };
        }
        return updated;
      });
      
      // Make sure we preserve the ID
      updatedAppointment.id = editingAppointment.id;
      
      // Call API to update the appointment
      await PetService.updateVetAppointment(petId, editingAppointment.id, updatedAppointment);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh appointments data from server
      await refreshAppointments();
      
      // Show success message
      showSuccessMessage("Appointment updated successfully!");
      
      // Reset editing state
      setEditingAppointment(null);
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError(err instanceof Error ? err.message : "Failed to update appointment");
      
      // Even if there was an error, still refresh to see the current state
      await refreshAppointments();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle deleting an appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update local state optimistically
      setLocalAppointments(prev => prev.filter(a => String(a.id) !== String(appointmentId)));
      
      // Use the PetService to delete the appointment
      await PetService.deleteVetAppointment(petId, appointmentId);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh appointments data from server
      await refreshAppointments();
      
      // Show success message
      showSuccessMessage("Appointment deleted successfully!");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError(err instanceof Error ? err.message : "Failed to delete appointment");
      
      // Even if there was an error, still refresh to see the current state
      await refreshAppointments();
    } finally {
      setLoading(false);
    }
  };
  
  // If we're showing the add form
  if (formVisible) {
    return (
      <VetAppointmentForm 
        onSubmit={handleAddAppointment} 
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }
  
  // If we're showing the edit form
  if (editingAppointment) {
    return (
      <VetAppointmentForm
        initialData={editingAppointment.data}
        onSubmit={handleUpdateAppointment}
        onCancel={() => setEditingAppointment(null)}
        petId={petId}
        appointmentId={editingAppointment.id}
      />
    );
  }
  
  // Deduplicate appointments for display
  const displayAppointments = deduplicateAppointments(localAppointments);
  
  if (displayAppointments.length === 0) {
    return (
      <EmptyState 
        category="vet appointment" 
        isOwner={isOwner} 
        onAddClick={() => setFormVisible(true)} 
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Veterinary Appointments</h3>
        <div className="flex space-x-2">
          {isOwner && (
            <button
              onClick={() => setFormVisible(true)}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Add Appointment'}
            </button>
          )}
          <button
            onClick={() => refreshAppointments()}
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
          {displayAppointments.map((appointment) => (
            <li key={appointment.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900">
                    Appointment on {formatDate(appointment.date)}
                  </p>
                  <div className="mt-2 space-y-2">
                    {appointment.reason && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Reason:</span> {appointment.reason}
                      </p>
                    )}
                    {appointment.diagnostic && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Diagnosis:</span> {appointment.diagnostic}
                      </p>
                    )}
                    {appointment.treatment && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Treatment:</span> {appointment.treatment}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingAppointment({ data: appointment, id: appointment.id || '' })}
                      disabled={loading || !appointment.id || appointment.id.startsWith('optimistic-')}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => appointment.id && handleDeleteAppointment(appointment.id)}
                      disabled={loading || !appointment.id || appointment.id.startsWith('optimistic-')}
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

export default VetAppointmentsComponent;