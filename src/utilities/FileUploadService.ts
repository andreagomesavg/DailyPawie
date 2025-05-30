// Types for the file upload service
interface DocumentUploadData {
  title?: string;
  description?: string;
  category?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DocumentFile {
  url?: string;
  path?: string;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  category?: string;
  url?: string;
  file?: string | DocumentFile;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  mimeType?: string;
  filename?: string;
}

export const uploadDocument = async (
  file: File,
  additionalData: DocumentUploadData = {}
): Promise<string> => {
  try {
    // Ensure title is set
    const title = additionalData.title || file.name || 'Uploaded Document';
    
    // Create FormData with title explicitly as first field
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    
    // Add any additional data fields
    Object.entries(additionalData).forEach(([key, value]) => {
      if (key !== 'title' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    console.log('Uploading document with title:', title);
    
    // Make the request 
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(data)}`);
    }
    
    return data.id;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Function to get document details by ID
export const getDocument = async (documentId: string): Promise<Document> => {
  try {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    console.log(`Fetching document with ID: ${documentId}`);
    
    const response = await fetch(`/api/documents/${documentId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch document: ${response.status} - ${errorText}`);
    }
    
    const document: Document = await response.json();
    
    // Log the document to help identify URL and other properties
    console.log('Document fetched:', document);
    
    // In case our document structure doesn't have a direct 'url' property,
    // check common patterns for file URLs
    if (!document.url && document.file) {
      // Handle various possible document structures
      if (typeof document.file === 'string') {
        document.url = document.file;
      } else if (typeof document.file === 'object' && document.file.url) {
        document.url = document.file.url;
      } else if (typeof document.file === 'object' && document.file.path) {
        // Construct URL from path if needed
        document.url = `/api/documents/${documentId}/file`;
      }
    }
    
    // If we still don't have a URL, create a download URL
    if (!document.url) {
      document.url = `/api/documents/${documentId}/download`;
    }
    
    return document;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
};