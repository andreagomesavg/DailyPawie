"use client"
import React, { useState, useEffect } from 'react';
import PetService from '@/utilities/PetService';
import { formatDate } from '@/utilities/dateFormatter';
import EmptyState from './medical-record/Empty-State';
import ReminderForm from './medical-record/ReminderForm';

interface Reminder {
  id?: string;
  type: string;
  date: string;
  time?: string;
  description?: string;
}

interface RemindersComponentProps {
  reminders?: Reminder[];
  petId: string;
  isOwner: boolean;
  onUpdate?: (reminders: Reminder[]) => void;
}

const RemindersComponent: React.FC<RemindersComponentProps> = ({ 
  reminders: initialReminders = [], 
  petId, 
  isOwner,
  onUpdate
}) => {
  // State
  const [formVisible, setFormVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<{ data: Reminder; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localReminders, setLocalReminders] = useState<Reminder[]>(initialReminders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const remindersPerPage = 3;

  // Effect to update local state when props change
  useEffect(() => {
    if (!isRefreshing) {
      setLocalReminders(initialReminders);
    }
  }, [initialReminders, isRefreshing]);

  // Effect to reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Helper function to check if a date is in the past
  const isDatePast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(dateString);
    reminderDate.setHours(0, 0, 0, 0);
    return reminderDate < today;
  };

  // Helper function to get reminder type label
  const getReminderTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'vaccine': 'Vaccine',
      'deworming': 'Deworming',
      'vetAppointment': 'Vet Appointment',
      'medication': 'Medication',
      'haircut': 'Haircut',
      'bath': 'Bath',
      'other': 'Other'
    };
    return types[type] || type;
  };

  // Function to refresh reminders data from the server
  const refreshReminders = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh pet data to get updated reminders
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedReminders = petData.reminders || [];
      console.log("Updated reminders from refresh:", updatedReminders);
      
      // Update local state
      setLocalReminders(updatedReminders);
      
      // Update parent component if onUpdate prop is provided
      if (onUpdate) {
        onUpdate(updatedReminders);
      }
      
      return updatedReminders;
    } catch (err) {
      console.error("Error refreshing reminders data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh reminders data");
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
  
  // Helper function to deduplicate reminders
  const deduplicateReminders = (reminders: Reminder[]): Reminder[] => {
    const uniqueReminders: Reminder[] = [];
    const seen = new Set<string>();
    
    for (const reminder of reminders) {
      // Create a key from the reminder's unique fields
      const key = `${reminder.date}-${reminder.type}-${reminder.time || ''}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReminders.push(reminder);
      }
    }
    
    return uniqueReminders;
  };
  
  // Function to handle adding a new reminder
  const handleAddReminder = async (newReminder: Reminder) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding reminder:", newReminder);
      
      // Add to local state optimistically
      const optimisticReminder = { 
        ...newReminder, 
        id: `optimistic-${Date.now()}` 
      };
      
      const updatedReminders = deduplicateReminders([...localReminders, optimisticReminder]);
      setLocalReminders(updatedReminders);
      
      // Also update parent component immediately with optimistic data
      if (onUpdate) {
        onUpdate(updatedReminders);
      }
      
      // Call API to add the reminder
      await PetService.addReminder(petId, newReminder);
      
      // Refresh reminders data from server
      await refreshReminders();
      
      // Show success message
      showSuccessMessage("Reminder added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding reminder:", err);
      setError(err instanceof Error ? err.message : "Failed to add reminder");
      
      // Even if there was an error, still refresh to see if the reminder was actually added
      await refreshReminders();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle updating an existing reminder
  const handleUpdateReminder = async (updatedReminder: Reminder) => {
    if (!editingReminder) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original reminder:", editingReminder.data);
      console.log("Updated reminder to send:", updatedReminder);
      
      // Update local state optimistically
      const updatedReminders = [...localReminders];
      const index = updatedReminders.findIndex(r => String(r.id) === String(editingReminder.id));
      if (index !== -1) {
        updatedReminders[index] = { ...updatedReminder, id: editingReminder.id };
      }
      
      // Update local state and parent component
      setLocalReminders(updatedReminders);
      if (onUpdate) {
        onUpdate(updatedReminders);
      }
      
      // Make sure we preserve the ID
      updatedReminder.id = editingReminder.id;
      
      // Call API to update the reminder
      await PetService.updateReminder(petId, editingReminder.id, updatedReminder);
      
      // Refresh reminders data from server to ensure consistency
      await refreshReminders();
      
      // Show success message
      showSuccessMessage("Reminder updated successfully!");
      
      // Reset editing state
      setEditingReminder(null);
    } catch (err) {
      console.error("Error updating reminder:", err);
      setError(err instanceof Error ? err.message : "Failed to update reminder");
      
      // Even if there was an error, still refresh to see the current state
      await refreshReminders();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle deleting a reminder
  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update local state optimistically
      const updatedReminders = localReminders.filter(r => String(r.id) !== String(reminderId));
      setLocalReminders(updatedReminders);
      
      // Also update parent component with optimistic change
      if (onUpdate) {
        onUpdate(updatedReminders);
      }
      
      // Call API to delete the reminder
      await PetService.deleteReminder(petId, reminderId);
      
      // Refresh reminders data from server to ensure consistency
      await refreshReminders();
      
      // Show success message
      showSuccessMessage("Reminder deleted successfully!");
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError(err instanceof Error ? err.message : "Failed to delete reminder");
      
      // Even if there was an error, still refresh to see the current state
      await refreshReminders();
    } finally {
      setLoading(false);
    }
  };

  // Pagination functions
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // If we're showing the add form
  if (formVisible) {
    return (
      <ReminderForm 
        onSubmit={handleAddReminder} 
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }
  
  // If we're showing the edit form
  if (editingReminder) {
    return (
      <ReminderForm
        initialData={editingReminder.data}
        onSubmit={handleUpdateReminder}
        onCancel={() => setEditingReminder(null)}
        petId={petId}
        reminderId={editingReminder.id}
      />
    );
  }
  
  // Filter reminders based on the active filter
  const filteredReminders = localReminders.filter(reminder => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return !isDatePast(reminder.date);
    if (activeFilter === 'past') return isDatePast(reminder.date);
    return true;
  });
  
  // Sort reminders by date (upcoming first for upcoming, past first for past)
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Deduplicate reminders for display
  const allReminders = deduplicateReminders(sortedReminders);
  
  // Calculate pagination values
  const indexOfLastReminder = currentPage * remindersPerPage;
  const indexOfFirstReminder = indexOfLastReminder - remindersPerPage;
  const currentReminders = allReminders.slice(indexOfFirstReminder, indexOfLastReminder);
  const totalPages = Math.ceil(allReminders.length / remindersPerPage);
  
  if (allReminders.length === 0 && !error) {
    return (
      <EmptyState 
        category="reminder" 
        isOwner={isOwner} 
        onAddClick={() => setFormVisible(true)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`py-1  mt-2 rounded-md font-normal text-lg 
                      bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer ${
            activeFilter === 'upcoming'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveFilter('past')}
          className={`py-1  mt-2 rounded-md font-normal text-lg 
                      bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer  ${
            activeFilter === 'past'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`py-1  mt-2 rounded-md font-normal text-lg 
                      bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#f4f6f5] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer  ${
            activeFilter === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        {isOwner && (
          <button
            onClick={() => setFormVisible(true)}
            disabled={loading}
            className="px-4 py-3 text-lg font-semibold text-white bg-[#3479ba] border border-[#3479ba] rounded-md shadow-sm hover:cursor-pointer hover:text-[#3479ba] hover:bg-white disabled:opacity-50 disabled:bg-[#001e4c] "
          >
            {loading ? 'Loading...' : 'Add Reminder'}
          </button>
        )}
        <button
          onClick={() => refreshReminders()}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-1 text-lg font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer hover:bg-gray-200 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="px-4 py-2 mb-4 text-lg text-red-700 bg-red-100 border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="px-4 py-2 mb-4 text-lg text-green-700 bg-green-100 border-l-4 border-green-500">
          {successMessage}
        </div>
      )}
      
      {loading && (
        <div className="px-4 py-2 mb-4 text-lg text-blue-700 bg-blue-100 border-l-4 border-blue-500">
          Processing your request...
        </div>
      )}

      {/* Reminders list */}
      {allReminders.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <ul className="pl-0 ml-0 list-none divide-y divide-gray-200">
            {currentReminders.map((reminder, index) => (
              <li 
                key={reminder.id || `temp-${index}`}
                className={`px-4 py-4 sm:px-6 ${
                  isDatePast(reminder.date) ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium ${
                          isDatePast(reminder.date) 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isDatePast(reminder.date) ? 'Past' : 'Upcoming'}
                      </span>
                      <span 
                        className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium bg-blue-100 text-blue-800"
                      >
                        {getReminderTypeLabel(reminder.type)}
                      </span>
                    </div>
                    <p className="mt-2 text-[24px] font-medium text-gray-900 mb-0">
                      {formatDate(reminder.date, 'en-US')} {reminder.time && `at ${reminder.time}`}
                    </p>
                    {reminder.description && (
                      <p className="mt-1 text-[18px] text-gray-500">{reminder.description}</p>
                    )}
                  </div>
                  
                  {/* Action buttons for edit and delete */}
                  {isOwner && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingReminder({ data: reminder, id: reminder.id || '' })}
                        disabled={loading || !reminder.id || reminder.id.startsWith('optimistic-')}
                        className="inline-flex items-center px-4 py-1 text-lg font-medium text-gray-700 border border-gray-200 rounded-md hover:opacity-80 disabled:opacity-50 hover:cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => reminder.id && handleDeleteReminder(reminder.id)}
                        disabled={loading || !reminder.id || reminder.id.startsWith('optimistic-')}
                        className="inline-flex items-center px-2 py-1 text-lg font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          
          {/* Pagination Controls */}
          {allReminders.length > remindersPerPage && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-lg text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-4 py-2 ml-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstReminder + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastReminder, allReminders.length)}
                    </span>{" "}
                    of <span className="font-medium">{allReminders.length}</span> reminders
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page number buttons */}
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-lg font-semibold ${
                          currentPage === index + 1
                            ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">
            No {activeFilter} reminders found.
          </p>
        </div>
      )}
    </div>
  );
};

export default RemindersComponent;