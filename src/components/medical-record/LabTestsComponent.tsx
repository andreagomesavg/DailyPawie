import { LaboratoryTest } from '@/utilities/MedicalRecord';
import React, { useState, useEffect } from 'react';
import EmptyState from './Empty-State';
import { formatDate } from '@/utilities/dateFormatter';
import LabTestForm from './LabTestForm';
import PetService from '@/utilities/PetService';
import { getDocument } from '@/utilities/FileUploadService';

// Helper function to convert test type to display name
const getTestTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'blood': 'Blood Tests',
    'urine': 'Urine Analysis',
    'x-ray': 'X-Ray',
    'ultrasound': 'Ultrasound',
    'another': 'Other Test'
  };
  
  return typeMap[type] || type; // Return mapped value or the original if not found
};

interface DocumentInfo {
  id: string;
  url?: string;
  title?: string;
  filename?: string;
}

interface LabTestsComponentProps {
  laboratoryTests: LaboratoryTest[];
  isOwner: boolean;
  onUpdate: (laboratoryTests: LaboratoryTest[]) => void;
  petId: string; 
}

const LabTestsComponent: React.FC<LabTestsComponentProps> = ({ 
  laboratoryTests, 
  isOwner, 
  onUpdate,
  petId 
}) => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState<{ data: LaboratoryTest; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<Record<string, DocumentInfo>>({});
  const [localLabTests, setLocalLabTests] = useState<LaboratoryTest[]>(laboratoryTests);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Effect to update local state when props change
  useEffect(() => {
    if (!isRefreshing) {
      setLocalLabTests(laboratoryTests);
    }
  }, [laboratoryTests, isRefreshing]);
  
  // Load document information for all tests
  useEffect(() => {
    const loadDocuments = async () => {
      const docInfo: Record<string, DocumentInfo> = {};
      
      for (const test of localLabTests) {
        if (test.resultsDocs) {
          try {
            // Get document ID
            const docId = typeof test.resultsDocs === 'string' 
              ? test.resultsDocs 
              : test.resultsDocs.id;
            
            // Skip if we already have this document's info
            if (docInfo[docId]) continue;
            
            // Fetch document details
            const doc = await getDocument(docId);
            
            // Store document info
            docInfo[docId] = {
              id: docId,
              url: doc.url,
              title: doc.title,
              filename: doc.filename
            };
          } catch (error) {
            console.error(`Error fetching document info for test ${test.id}:`, error);
          }
        }
      }
      
      setDocumentInfo(prev => ({...prev, ...docInfo}));
    };
    
    loadDocuments();
  }, [localLabTests]);
  
  // Function to refresh lab tests data from the server
  const refreshLabTests = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh pet data to get updated lab tests
      const petData = await PetService.getPet(petId);
      console.log("Pet data from refresh:", petData);
      
      const updatedLabTests = petData.medicalRecord?.laboratoryTests || [];
      console.log("Updated lab tests from refresh:", updatedLabTests);
      
      // Update local state immediately for better UI responsiveness
      setLocalLabTests(updatedLabTests);
      
      // Update parent component with fresh data
      onUpdate(updatedLabTests);
      return updatedLabTests;
    } catch (err) {
      console.error("Error refreshing lab tests data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh lab tests data");
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
  
  // Helper function to deduplicate lab tests
  const deduplicateLabTests = (labTests: LaboratoryTest[]): LaboratoryTest[] => {
    const uniqueLabTests: LaboratoryTest[] = [];
    const seen = new Set<string>();
    
    for (const test of labTests) {
      // Create a key from the lab test's unique fields
      const key = `${test.type}-${test.date || 'nodate'}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLabTests.push(test);
      }
    }
    
    return uniqueLabTests;
  };
  
  // Function to handle adding a new lab test
  const handleAddLabTest = async (newLabTest: LaboratoryTest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Adding lab test:", newLabTest);
      
      // First check if this lab test already exists to prevent duplicates
      const isDuplicate = localLabTests.some(
        test => test.type === newLabTest.type && test.date === newLabTest.date
      );
      
      if (isDuplicate) {
        setError("A lab test with this type and date already exists");
        setLoading(false);
        return;
      }
      
      // Add to local state optimistically to improve UI responsiveness
      const optimisticLabTest = { 
        ...newLabTest, 
        id: `optimistic-${Date.now()}` 
      };
      
      setLocalLabTests(prev => {
        const updated = [...prev, optimisticLabTest];
        return deduplicateLabTests(updated);
      });
      
      // Call API to add the lab test
      await PetService.addLabTest(petId, newLabTest);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh lab tests data from server
      await refreshLabTests();
      
      // Show success message
      showSuccessMessage("Laboratory test added successfully!");
      
      // Hide the form after successful submission
      setFormVisible(false);
    } catch (err) {
      console.error("Error adding laboratory test:", err);
      setError(err instanceof Error ? err.message : "Failed to add laboratory test");
      
      // Even if there was an error, still refresh to see if the lab test was actually added
      await refreshLabTests();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle updating an existing lab test
  const handleUpdateLabTest = async (updatedLabTest: LaboratoryTest) => {
    if (!editingLabTest) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Original lab test:", editingLabTest.data);
      console.log("Updated lab test to send:", updatedLabTest);
      
      // Update local state optimistically
      setLocalLabTests(prev => {
        const updated = [...prev];
        const index = updated.findIndex(t => String(t.id) === String(editingLabTest.id));
        if (index !== -1) {
          updated[index] = { ...updatedLabTest, id: editingLabTest.id };
        }
        return updated;
      });
      
      // Make sure we preserve the ID
      updatedLabTest.id = editingLabTest.id;
      
      // Call API to update the lab test
      await PetService.updateLabTest(petId, editingLabTest.id, updatedLabTest);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh lab tests data from server
      await refreshLabTests();
      
      // Show success message
      showSuccessMessage("Laboratory test updated successfully!");
      
      // Reset editing state
      setEditingLabTest(null);
    } catch (err) {
      console.error("Error updating laboratory test:", err);
      setError(err instanceof Error ? err.message : "Failed to update laboratory test");
      
      // Even if there was an error, still refresh to see the current state
      await refreshLabTests();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle deleting a lab test
  const handleDeleteLabTest = async (labTestId: string) => {
    if (!confirm("Are you sure you want to delete this laboratory test?")) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update local state optimistically
      setLocalLabTests(prev => prev.filter(t => String(t.id) !== String(labTestId)));
      
      // Use the PetService to delete the lab test
      await PetService.deleteLabTest(petId, labTestId);
      
      // Wait a bit to ensure the backend has processed the request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh lab tests data from server
      await refreshLabTests();
      
      // Show success message
      showSuccessMessage("Laboratory test deleted successfully!");
    } catch (err) {
      console.error("Error deleting laboratory test:", err);
      setError(err instanceof Error ? err.message : "Failed to delete laboratory test");
      
      // Even if there was an error, still refresh to see the current state
      await refreshLabTests();
    } finally {
      setLoading(false);
    }
  };
  
  // Function to render document link - simplified approach to avoid red underlines
  const renderDocumentLink = (docRef: string | { id: string }) => {
    // Get document ID
    const docId = typeof docRef === 'string' ? docRef : docRef.id;
    
    // Get document URL and title
    const url = documentInfo[docId]?.url;
    const title = documentInfo[docId]?.title || documentInfo[docId]?.filename || 'Test Results';
    
    // If URL exists, render a link
    if (url) {
      return (
        <p className="text-xl text-[#3479ba] sm:col-span-2">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            View Document: {title}
          </a>
        </p>
      );
    }
    
    // If no URL, render with refresh button
    return (
      <p className="text-xl text-[#3479ba] sm:col-span-2">
        <span className="font-medium">
          Document Attached: {title} 
          <button 
            className="ml-2 text-xl text-blue-500 underline"
            onClick={async () => {
              try {
                // Try to force-refresh document info
                console.log('Manually refreshing document info for:', docId);
                const doc = await getDocument(docId);
                
                setDocumentInfo(prev => ({
                  ...prev,
                  [docId]: {
                    id: docId,
                    url: doc.url,
                    title: doc.title,
                    filename: doc.filename
                  }
                }));
              } catch (error) {
                console.error('Error refreshing document info:', error);
              }
            }}
          >
            Refresh Link
          </button>
        </span>
      </p>
    );
  };
  
  // If we're showing the add form
  if (formVisible) {
    return (
      <LabTestForm 
        onSubmit={handleAddLabTest} 
        onCancel={() => setFormVisible(false)}
        petId={petId}
      />
    );
  }
  
  // If we're showing the edit form
  if (editingLabTest) {
    return (
      <LabTestForm
        initialData={editingLabTest.data}
        onSubmit={handleUpdateLabTest}
        onCancel={() => setEditingLabTest(null)}
        petId={petId}
        labTestId={editingLabTest.id}
      />
    );
  }
  
  // Deduplicate lab tests for display
  const displayLabTests = deduplicateLabTests(localLabTests);
  
  if (displayLabTests.length === 0) {
    return (
      <EmptyState 
        category="laboratory tests" 
        isOwner={isOwner} 
        onAddClick={() => setFormVisible(true)} 
      />
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          tracking-tight text-[30px]">Laboratory Tests</h3>
        <div className="flex space-x-2">
          {isOwner && (
            <button
              onClick={() => setFormVisible(true)}
              disabled={loading}
              className="inline-flex items-center px-3 py-1 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Add Test'}
            </button>
          )}
          <button
            onClick={() => refreshLabTests()}
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
          {displayLabTests.map((item) => (
            <li key={item.id || 'temp-' + Math.random()} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-medium text-gray-900 truncate">
                    {getTestTypeDisplay(item.type)}
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
                    {item.date && (
                      <p className="text-xl text-gray-500">
                        <span className="font-medium">Date:</span> {formatDate(item.date)}
                      </p>
                    )}
                    {item.results && (
                      <p className="text-xl text-gray-500 sm:col-span-2">
                        <span className="font-medium">Results:</span> {item.results}
                      </p>
                    )}
                    {/* Simplified document reference rendering */}
                    {item.resultsDocs && renderDocumentLink(item.resultsDocs)}
                  </div>
                </div>
                
                {/* Action buttons for edit and delete */}
                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingLabTest({ data: item, id: item.id || '' })}
                      disabled={loading || !item.id || item.id.startsWith('optimistic-')}
                      className="inline-flex items-center px-2 py-1 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => item.id && handleDeleteLabTest(item.id)}
                      disabled={loading || !item.id || item.id.startsWith('optimistic-')}
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

export default LabTestsComponent;