import { LaboratoryTest } from '@/utilities/MedicalRecord';
import React, { useState } from 'react';

// Define the valid test types to ensure proper typing
type TestType = 'blood' | 'urine' | 'x-ray' | 'ultrasound' | 'another';

interface LabTestFormProps {
  initialData?: LaboratoryTest;
  onSubmit: (labTest: LaboratoryTest) => void;
  onCancel: () => void;
  petId: string;
  labTestId?: string;
}

const LabTestForm: React.FC<LabTestFormProps> = ({ 
  initialData = { type: 'blood' as TestType, date: '', id: '', results: '' },
  onSubmit, 
  onCancel,
  petId: _petId, // Prefix with underscore to indicate intentionally unused
  labTestId
}) => {
  const [type, setType] = useState<TestType>(initialData.type as TestType || 'blood');
  const [date, setDate] = useState(initialData.date || '');
  const [results, setResults] = useState(initialData.results || '');
  const [resultsDocs] = useState<string | { id: string } | undefined>(initialData.resultsDocs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status ] = useState<string | null>(null);

  // Removed unused file upload related state variables since file upload functionality is commented out

  // Determine if we're editing an existing test or adding a new one
  const isEditing = initialData && (initialData.date !== '' || !!labTestId);

  // Helper function to get the display name for a test type (kept for potential future use)
  const _getTestTypeDisplay = (type: TestType): string => {
    const typeMap: Record<TestType, string> = {
      'blood': 'Blood Tests',
      'urine': 'Urine Analysis',
      'x-ray': 'X-Ray',
      'ultrasound': 'Ultrasound',
      'another': 'Other Test'
    };
    
    return typeMap[type] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!type) {
      setError("Test type is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Handle file upload if there's a selected file
      const resultDocsId = resultsDocs; // Changed from 'let' to 'const' since it's not reassigned
      
      // File upload functionality is currently commented out
      // If you want to re-enable file uploads, uncomment the file upload section
      // and restore the file upload related state variables
      
      // Create a complete lab test object
      const labTestData: LaboratoryTest = {
        id: labTestId || '',
        type,
        date,
        results,
        // Only include resultsDocs if we have a proper document ID
        ...(resultDocsId ? { resultsDocs: resultDocsId } : {})
      };
      
      console.log("Lab test data to submit:", labTestData);
      
      // Call the onSubmit function to let parent component handle the API call
      onSubmit(labTestData);
      // Don't close the form here - let the parent component decide when to close it
    } catch (err) {
      console.error("Error processing laboratory test:", err);
      setError(err instanceof Error ? err.message : "Failed to process laboratory test");
      setIsSubmitting(false);
    }
  };

  // Removed handleFileUpload function since file upload functionality is commented out

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        {isEditing ? 'Edit Laboratory Test' : 'Add Laboratory Test'}
      </h3>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
          <label htmlFor="type" className="block text-xl font-medium text-gray-700">
            Test Type 
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as TestType)}
            required
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          >
            <option value="blood">Blood tests</option>
            <option value="urine">Urine analysis</option>
            <option value="x-ray">X-ray</option>
            <option value="ultrasound">Ultrasound</option>
            <option value="another">Another</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-xl font-medium text-gray-700">
            Test Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          />
        </div>
        </div>
      

        <div>
          <label htmlFor="results" className="block text-xl font-medium text-gray-700">
            Test Results
          </label>
          <textarea
            id="results"
            name="results"
            value={results}
            onChange={(e) => setResults(e.target.value)}
            className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Enter test results or observations"
          ></textarea>
        </div>

        {/* File upload functionality is commented out
        
        To re-enable file uploads, you would need to:
        1. Add back the file upload related state variables:
           - selectedFileName, setSelectedFileName
           - selectedFile, setSelectedFile  
           - fileUploading, setFileUploading
           - fileError, setFileError
        2. Add back the handleFileUpload function
        3. Uncomment the file upload JSX section below
        4. Re-import the uploadDocument utility
        5. Change resultDocsId back to 'let' if file upload logic is re-enabled
        
        <div>
          <label htmlFor="resultsDocs" className="block text-xl font-medium text-gray-700">
            Upload Results Document
          </label>
          <input
            type="file"
            id="resultsDocs"
            name="resultsDocs"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            disabled={isSubmitting || fileUploading}
          />
          {fileUploading && <p className="mt-1 text-xl text-gray-500">Uploading...</p>}
          {fileError && <p className="mt-1 text-xl text-red-600">{fileError}</p>}
          {selectedFileName && (
            <p className="mt-1 text-xl text-green-600">
              File selected: {selectedFileName}
            </p>
          )}
          {resultsDocs && !selectedFileName && (
            <p className="mt-1 text-xl text-blue-600">
              Existing document attached
            </p>
          )}
          <p className="mt-1 text-xl text-gray-500">
            Only PDF files are accepted (max 10MB)
          </p>
        </div> */}

        {error && <div className="text-xl text-red-600">{error}</div>}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] rounded-md hover:bg-[#3479ba] disabled:bg-blue-400"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Test' : 'Save Test'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabTestForm;