'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { formatDate } from '@/utilities/dateFormatter'
import EmptyState from './medical-record/Empty-State'
import ReminderForm from './medical-record/ReminderForm'

interface Reminder {
  id?: string
  type: string
  date: string
  time?: string
  description?: string
  petId?: string
  petName?: string
}

interface Pet {
  id: string
  name: string
  reminders?: Reminder[]
}

interface AllRemindersProps {
  userPets?: Pet[]
  isOwner: boolean
  maxReminders?: number | null // Allow null to explicitly mean no limit
  showViewAll?: boolean // New prop to control if "View All" button is shown
  onViewAllClick?: () => void // Callback for "View All" button
}

// Define interface for reminder from API response
interface ReminderFromAPI {
  id?: string
  type: string
  date: string
  time?: string
  description?: string
  [key: string]: unknown
}

const AllRemindersComponent: React.FC<AllRemindersProps> = ({ 
  userPets = [], 
  isOwner,
  maxReminders = 4, // Default to 4 reminders for dashboard view
  showViewAll = true, 
  onViewAllClick
}) => {
  // State variables
  const [formVisible, setFormVisible] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [editingReminder, setEditingReminder] = useState<{ data: Reminder; id: string } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [allReminders, setAllReminders] = useState<Reminder[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  // Function to fetch all reminders from all pets - memoized to prevent useEffect dependency issues
  const fetchAllReminders = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      const combinedReminders: Reminder[] = []

      console.log('Fetching reminders from pets:', userPets)

      // For each pet, fetch its data and extract reminders
      for (const pet of userPets) {
        try {
          console.log(`Fetching data for pet ${pet.id} (${pet.name})`)
          // Assume we have a fetch API call here
          const response = await fetch(`/api/pets/${pet.id}`, {
            credentials: 'include',
          })

          if (!response.ok) {
            throw new Error(`Failed to fetch data for pet ${pet.name}`)
          }

          const petData = await response.json()
          console.log(`Reminders for pet ${pet.name}:`, petData.reminders)

          const petReminders = petData.reminders || []

          // Add pet information to each reminder
          const enrichedReminders = petReminders.map((reminder: Reminder) => ({
            ...reminder,
            petId: pet.id,
            petName: pet.name,
          }))

          console.log(`Enriched reminders for ${pet.name}:`, enrichedReminders)
          combinedReminders.push(...enrichedReminders)
        } catch (err) {
          console.error(`Error fetching reminders for pet ${pet.id}:`, err)
        }
      }

      console.log('Combined reminders from all pets:', combinedReminders)
      setAllReminders(combinedReminders)
      return combinedReminders
    } catch (err) {
      console.error('Error fetching all reminders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders')
      return []
    } finally {
      setIsRefreshing(false)
    }
  }, [userPets])

  // Effect to load reminders when component mounts or when dependencies change
  useEffect(() => {
    console.log('AllRemindersComponent - Available pets:', userPets)
    console.log('AllRemindersComponent - maxReminders:', maxReminders)
    console.log('AllRemindersComponent - isOwner:', isOwner)
    if (userPets && userPets.length > 0) {
      fetchAllReminders()
    } else {
      console.log('AllRemindersComponent - No pets available or empty array')
    }
  }, [userPets, fetchAllReminders, isOwner, maxReminders])

  // Effect to reset filter to 'upcoming' when in limited mode
  useEffect(() => {
    const shouldLimitReminders = maxReminders !== null && maxReminders !== undefined && maxReminders > 0
    if (shouldLimitReminders && (activeFilter === 'past' || activeFilter === 'all')) {
      setActiveFilter('upcoming')
    }
  }, [maxReminders, activeFilter])

  // Helper function to check if a date is in the past
  const isDatePast = (dateString: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reminderDate = new Date(dateString)
    reminderDate.setHours(0, 0, 0, 0)
    return reminderDate < today
  }

  // Helper function to get reminder type label
  const getReminderTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      vaccine: 'Vaccine',
      deworming: 'Deworming',
      vetAppointment: 'Vet Appointment',
      medication: 'Medication',
      haircut: 'Haircut',
      bath: 'Bath',
      other: 'Other',
    }
    return types[type] || type
  }

  // Helper function to show success message
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Helper function to deduplicate reminders
  const deduplicateReminders = (reminders: Reminder[]): Reminder[] => {
    const uniqueReminders: Reminder[] = []
    const seen = new Set<string>()

    for (const reminder of reminders) {
      // Create a key from the reminder's unique fields
      const key = `${reminder.petId}-${reminder.date}-${reminder.type}-${reminder.time || ''}`

      if (!seen.has(key)) {
        seen.add(key)
        uniqueReminders.push(reminder)
      }
    }

    return uniqueReminders
  }

  // Function to handle adding a new reminder
  const handleAddReminder = async (newReminder: Reminder) => {
    if (!selectedPetId) {
      setError('Please select a pet to add a reminder')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Try the dedicated endpoint first
      try {
        const response = await fetch(`/api/pets/${selectedPetId}/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newReminder),
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('First attempt failed')
        }
      } catch (_firstAttemptError) {
        console.log('Trying alternative approach...')

        // Fallback: first get current pet data with existing reminders
        const petResponse = await fetch(`/api/pets/${selectedPetId}`, {
          credentials: 'include',
        })

        if (!petResponse.ok) {
          throw new Error(`Failed to fetch pet data`)
        }

        const petData = await petResponse.json()

        // Get existing reminders
        const currentReminders = petData.reminders || []

        // Add the new reminder to the existing ones
        const reminderData = {
          ...newReminder,
          petId: selectedPetId,
        }

        const updatedReminders = [...currentReminders, reminderData]

        // Update pet with the combined reminders
        const fallbackResponse = await fetch(`/api/pets/${selectedPetId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminders: updatedReminders,
          }),
          credentials: 'include',
        })

        if (!fallbackResponse.ok) {
          throw new Error('Failed to add reminder after multiple attempts')
        }
      }

      // Refresh data and hide form
      await fetchAllReminders()
      showSuccessMessage('Reminder added successfully!')
      setFormVisible(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reminder')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an existing reminder
  const handleUpdateReminder = async (updatedReminder: Reminder) => {
    if (!editingReminder) return

    try {
      setLoading(true)
      setError(null)

      const petId = editingReminder.data.petId || ''
      console.log('Updating reminder for pet:', petId, updatedReminder)

      // Update optimistically in the UI
      const updatedReminders = [...allReminders]
      const index = updatedReminders.findIndex((r) => String(r.id) === String(editingReminder.id))
      if (index !== -1) {
        updatedReminders[index] = {
          ...updatedReminder,
          id: editingReminder.id,
          petId,
          petName: editingReminder.data.petName,
        }
      }

      setAllReminders(updatedReminders)

      // Make sure we preserve the ID
      updatedReminder.id = editingReminder.id

      // Try first API endpoint structure
      try {
        const response = await fetch(`/api/pets/${petId}/reminders/${editingReminder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedReminder),
          credentials: 'include',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`First update attempt failed with status ${response.status}:`, errorText)
          throw new Error(errorText || 'First update attempt failed')
        }

        const data = await response.json()
        console.log('Successfully updated reminder:', data)
      } catch (_firstAttemptError) {
        console.log('Trying alternative update endpoint...')

        // Try second API endpoint structure - update via PATCH to the pet
        const fallbackResponse = await fetch(`/api/pets/${petId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminders: [
              {
                ...updatedReminder,
                id: editingReminder.id,
              },
            ],
          }),
          credentials: 'include',
        })

        if (!fallbackResponse.ok) {
          const fallbackErrorText = await fallbackResponse.text()
          console.error('Both update API attempts failed:', fallbackErrorText)
          throw new Error(fallbackErrorText || 'Failed to update reminder after multiple attempts')
        }

        console.log('Successfully updated reminder via fallback method')
      }

      // Refresh reminders data to ensure consistency
      await fetchAllReminders()

      // Show success message
      showSuccessMessage('Reminder updated successfully!')

      // Reset editing state
      setEditingReminder(null)
    } catch (err) {
      console.error('Error updating reminder:', err)
      setError(err instanceof Error ? err.message : 'Failed to update reminder')

      // After a short delay, refresh to check if reminder was actually updated
      // despite the error (which seems to be happening in your case)
      setTimeout(async () => {
        await fetchAllReminders()
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a reminder
  const handleDeleteReminder = async (reminder: Reminder) => {
    if (!reminder.id || !reminder.petId) {
      setError('Missing reminder id or pet id')
      return
    }

    if (!confirm('Are you sure you want to delete this reminder?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Attempting to delete reminder:', reminder)

      // Update local state optimistically
      const updatedReminders = allReminders.filter((r) => String(r.id) !== String(reminder.id))
      setAllReminders(updatedReminders)

      // Try direct DELETE endpoint first
      try {
        const response = await fetch(`/api/pets/${reminder.petId}/reminders/${reminder.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`First deletion attempt failed with status ${response.status}:`, errorText)
          throw new Error(errorText || 'First deletion attempt failed')
        }

        console.log('Successfully deleted reminder using DELETE endpoint')
      } catch (_firstAttemptError) {
        console.log('Trying alternative deletion approach...')

        // Fallback: Fetch the current pet data
        const petResponse = await fetch(`/api/pets/${reminder.petId}`, {
          credentials: 'include',
        })

        if (!petResponse.ok) {
          throw new Error(`Failed to fetch pet data: ${petResponse.status}`)
        }

        const petData = await petResponse.json()
        console.log('Current pet data:', petData)

        // Extract current reminders array
        const currentReminders = petData.reminders || []
        console.log('Current reminders before deletion:', currentReminders)

        // Filter out the reminder to delete
        const filteredReminders = currentReminders.filter(
          (r: ReminderFromAPI) => String(r.id) !== String(reminder.id),
        )
        console.log('Filtered reminders after deletion:', filteredReminders)

        // Create a PATCH operation that specifies we're only updating the reminders
        const updateResponse = await fetch(`/api/pets/${reminder.petId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminders: filteredReminders,
            _operation: 'update_reminders', // Add this to signal a specific operation
          }),
          credentials: 'include',
        })

        if (!updateResponse.ok) {
          const responseText = await updateResponse.text()
          throw new Error(
            `Failed to update pet with filtered reminders: ${updateResponse.status} ${responseText}`,
          )
        }

        console.log('Successfully deleted reminder via fallback method')
      }

      // Wait a moment to ensure backend processing is complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Refresh reminders data from server
      await fetchAllReminders()

      // Show success message
      showSuccessMessage('Reminder deleted successfully!')
    } catch (err) {
      console.error('Error deleting reminder:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete reminder')

      // After a delay, refresh to check current state
      setTimeout(async () => {
        await fetchAllReminders()
      }, 1500)
    } finally {
      setLoading(false)
    }
  }

  // If we're showing the add form
  if (formVisible) {
    return (
      <div className="mt-4 space-y-4">
        <div className="mb-4">
          <label htmlFor="petSelect" className="block text-lg font-medium text-gray-700">
            Select Pet
          </label>
          <select
            id="petSelect"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
          >
            <option value="">Select a pet</option>
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>

        {selectedPetId && (
          <ReminderForm
            onSubmit={handleAddReminder}
            onCancel={() => setFormVisible(false)}
            petId={selectedPetId}
          />
        )}

        {!selectedPetId && (
          <div className="p-4 text-lg rounded-md text-amber-700 bg-amber-100">
            Please select a pet to add a reminder for
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => setFormVisible(false)}
            className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // If we're showing the edit form
  if (editingReminder) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-md bg-gray-50">
          <p className="text-xl text-gray-700">
            Editing reminder for <span className="font-medium">{editingReminder.data.petName}</span>
          </p>
        </div>

        <ReminderForm
          initialData={editingReminder.data}
          onSubmit={handleUpdateReminder}
          onCancel={() => setEditingReminder(null)}
          petId={editingReminder.data.petId || ''}
          reminderId={editingReminder.id}
        />
      </div>
    )
  }

  // Filter reminders based on the active filter
  const filteredReminders = allReminders.filter((reminder) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'upcoming') return !isDatePast(reminder.date)
    if (activeFilter === 'past') return isDatePast(reminder.date)
    return true
  })

  // Deduplicate all reminders first
  const uniqueReminders = deduplicateReminders(filteredReminders)

  // Sort by date and time - if time exists
  const sortedReminders = [...uniqueReminders].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)

    // If dates are different, sort by date
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime()
    }

    // If dates are the same, try to sort by time if available
    if (a.time && b.time) {
      // Convert times to comparable format (assuming HH:MM or HH:MM:SS format)
      const timeA = a.time.split(':')
      const timeB = b.time.split(':')

      // Compare hours
      if (parseInt(timeA[0]) !== parseInt(timeB[0])) {
        return parseInt(timeA[0]) - parseInt(timeB[0])
      }

      // Compare minutes
      if (timeA.length > 1 && timeB.length > 1) {
        if (parseInt(timeA[1]) !== parseInt(timeB[1])) {
          return parseInt(timeA[1]) - parseInt(timeB[1])
        }
      }
    }

    // If one has time and other doesn't, prioritize the one with time
    if (a.time && !b.time) return -1
    if (!a.time && b.time) return 1

    // Fall back to sorting by type if times are identical or missing
    return a.type.localeCompare(b.type)
  })

  // Limit the number of reminders to display
  const shouldLimitReminders = maxReminders !== null && maxReminders !== undefined && maxReminders > 0
  const limitedReminders = shouldLimitReminders ? sortedReminders.slice(0, maxReminders) : sortedReminders
  const hasMoreReminders = shouldLimitReminders && sortedReminders.length > maxReminders

  // Debug logging
  console.log('AllRemindersComponent - Debug Info:', {
    allReminders: allReminders.length,
    filteredReminders: filteredReminders.length,
    uniqueReminders: uniqueReminders.length,
    sortedReminders: sortedReminders.length,
    limitedReminders: limitedReminders.length,
    maxReminders,
    shouldLimitReminders,
    hasMoreReminders,
    activeFilter
  })

  // If there are no reminders to display, show empty state
  if (limitedReminders.length === 0 && !error && !isRefreshing) {
    console.log('AllRemindersComponent - Showing empty state')
    return (
      <EmptyState category="reminder" isOwner={isOwner} onAddClick={() => setFormVisible(true)} />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-[#001e4c] pt-2 font-bold leading-none text-left 
            text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight"
        >
          {shouldLimitReminders ? 'Recent Reminders' : 'All Pets Reminders'}
        </h2>
        {/* Show "View All" button if there are more reminders and callback is provided */}
        {hasMoreReminders && showViewAll && onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="px-4 py-2 text-lg font-medium text-[#3479ba] bg-white border-2 border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white transition-all duration-300 hover:cursor-pointer"
          >
            View All ({sortedReminders.length})
          </button>
        )}
      </div>

      {/* Filter buttons - simplified for limited view, full for unlimited view */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-1 mt-2 rounded-md font-normal text-lg 
                      transition-all duration-300 hover:cursor-pointer ${
                        activeFilter === 'upcoming'
                          ? 'bg-[#3479ba] text-white border-2 border-[#3479ba]'
                          : 'bg-white text-[#3479ba] border-2 border-[#3479ba] hover:bg-[#f4f6f5]'
                      }`}
        >
          Upcoming
        </button>
        
        {/* Only show Past and All buttons when not limiting reminders */}
        {!shouldLimitReminders && (
          <>
            <button
              onClick={() => setActiveFilter('past')}
              className={`px-4 py-1 mt-2 rounded-md font-normal text-lg 
                          transition-all duration-300 hover:cursor-pointer ${
                            activeFilter === 'past'
                              ? 'bg-[#3479ba] text-white border-2 border-[#3479ba]'
                              : 'bg-white text-[#3479ba] border-2 border-[#3479ba] hover:bg-[#f4f6f5]'
                          }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1 mt-2 rounded-md font-normal text-lg 
                          transition-all duration-300 hover:cursor-pointer ${
                            activeFilter === 'all'
                              ? 'bg-[#3479ba] text-white border-2 border-[#3479ba]'
                              : 'bg-white text-[#3479ba] border-2 border-[#3479ba] hover:bg-[#f4f6f5]'
                          }`}
            >
              All
            </button>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end space-x-2">
        {isOwner && (
          <button
            onClick={() => setFormVisible(true)}
            disabled={loading}
            className="px-4 py-3 text-lg font-semibold text-white bg-[#3479ba] border border-[#3479ba] rounded-md shadow-sm hover:cursor-pointer hover:text-[#3479ba] hover:bg-white disabled:opacity-50 disabled:bg-[#001e4c]"
          >
            {loading ? 'Loading...' : 'Add Reminder'}
          </button>
        )}
        <button
          onClick={() => fetchAllReminders()}
          disabled={isRefreshing}
          className="px-4 py-3 text-lg font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer hover:bg-gray-200 disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Status messages */}
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

      {/* Limited reminders list */}
      {isRefreshing ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
        </div>
      ) : limitedReminders.length > 0 ? (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <ul className="pl-0 ml-0 list-none divide-y divide-gray-200">
            {limitedReminders.map((reminder, index) => (
              <li
                key={reminder.id || `temp-${index}`}
                className={`px-4 py-4 sm:px-6 ${isDatePast(reminder.date) ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium ${
                          isDatePast(reminder.date)
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isDatePast(reminder.date) ? 'Past' : 'Upcoming'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-medium bg-blue-100 text-blue-800">
                        {getReminderTypeLabel(reminder.type)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-lg font-semibold">
                        {reminder.petName || 'Unknown Pet'}
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
                        onClick={() =>
                          setEditingReminder({ data: reminder, id: reminder.id || '' })
                        }
                        disabled={loading || !reminder.id || reminder.id.startsWith('optimistic-')}
                        className="inline-flex items-center px-4 py-1 text-xl font-medium text-gray-700 border border-gray-200 rounded-md hover:opacity-80 disabled:opacity-50 hover:cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder)}
                        disabled={loading || !reminder.id || reminder.id.startsWith('optimistic-')}
                        className="inline-flex opacity-80 items-center px-2 py-1 text-xl font-medium text-white bg-gray-400 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          
          {/* Show indicator if there are more reminders */}
          {hasMoreReminders && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Showing {limitedReminders.length} of {sortedReminders.length} reminders
              </p>
              {showViewAll && onViewAllClick && (
                <button
                  onClick={onViewAllClick}
                 className="px-4 py-2 text-lg font-medium text-[#3479ba] bg-white border-2 border-[#3479ba] rounded-md hover:bg-[#3479ba] hover:text-white transition-all duration-300 hover:cursor-pointer"
                >
                  View all reminders →
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow">
          <p className="text-gray-500">No {activeFilter} reminders found.</p>
        </div>
      )}
    </div>
  )
}

export default AllRemindersComponent