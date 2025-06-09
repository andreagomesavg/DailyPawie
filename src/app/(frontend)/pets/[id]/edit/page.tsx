"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
  photo?: {
    url: string;
  };
  petOwner?: {
    id: string;
    name: string;
  } | string;
}

interface User {
  user?: {
    id: string;
    roles: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditPetPage = ({ params }: PageProps) => {
  // Use React.use() to unwrap the Promise - same as your detail page
  const { id: petId } = React.use(params);
  
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    sex: '',
    age: '',
    height: '',
    weight: ''
  });

  // Photo state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch current user to check permissions - same pattern as detail page
        const userResponse = await fetch('/api/users/me', {
          credentials: 'include',
        });
        
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const userData: User = await userResponse.json();
        const userId = userData.user?.id;
        
        // Now fetch the pet details
        const petResponse = await fetch(`/api/pets/${petId}`, {
          credentials: 'include',
        });
        
        if (!petResponse.ok) {
          if (petResponse.status === 404) {
            router.push('/pets');
            return;
          }
          throw new Error('Failed to fetch pet details');
        }
        
        const petData: Pet = await petResponse.json();
        setPet(petData);
        
        // Set form data with existing pet data
        setFormData({
          name: petData.name || '',
          species: petData.species || 'dog',
          breed: petData.breed || '',
          sex: petData.sex || '',
          age: petData.age?.toString() || '',
          height: petData.height?.toString() || '',
          weight: petData.weight?.toString() || ''
        });
        
        // Check if current user is the pet owner
        if (petData.petOwner) {
          const ownerId = typeof petData.petOwner === 'object' ? petData.petOwner.id : petData.petOwner;
          const hasPermission = ownerId === userId || userData.user?.roles === 'admin';
          setIsOwner(hasPermission);
          
          if (!hasPermission) {
            router.push(`/pets/${petId}`);
            return;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (petId) {
      fetchData();
    }
  }, [petId, router]);

  // Cleanup photo preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    // Reset the file input
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;

    setSaving(true);
    setError(null);

    try {
      let photoId = null;

      // Handle photo upload first (if a new photo was selected)
      if (selectedPhoto) {
        try {
          setError(null);
          
          // Create descriptive alt text
          const altText = `Photo of ${formData.name} - Updated ${new Date().toISOString()}`;
          
          // Upload photo to media endpoint first
          const photoFormData = new FormData();
          photoFormData.append('file', selectedPhoto);
          photoFormData.append('alt', altText);
          
          const photoResponse = await fetch('/api/media', {
            method: 'POST',
            body: photoFormData,
            credentials: 'include',
          });

          if (!photoResponse.ok) {
            let errorText;
            try {
              errorText = await photoResponse.text();
            } catch (e) {
              errorText = 'Could not read response text';
            }
            throw new Error(`Photo upload failed: ${photoResponse.status} - ${errorText}`);
          }

          const photoResult = await photoResponse.json();
          photoId = photoResult.doc?.id || photoResult.id;
          
          if (!photoId) {
            console.error('No photo ID in response:', photoResult);
            throw new Error('Photo upload completed but no ID was returned');
          }
          
          console.log('✅ Photo uploaded successfully with ID:', photoId);
        } catch (photoError: any) {
          console.error('💥 Photo upload error:', photoError);
          throw new Error(`Failed to upload photo: ${photoError.message}`);
        }
      }

      // Prepare pet update data (using JSON, not FormData)
      const updateData: any = {
        name: formData.name,
        species: formData.species,
      };

      // Only include optional fields if they have values
      if (formData.breed) updateData.breed = formData.breed;
      if (formData.sex) updateData.sex = formData.sex;
      if (formData.age) updateData.age = parseInt(formData.age);
      if (formData.height) updateData.height = parseFloat(formData.height);
      if (formData.weight) updateData.weight = parseFloat(formData.weight);
      
      // Add photo ID if we uploaded a new photo
      if (photoId) {
        updateData.photo = photoId;
      }

      // Update pet with JSON data (not FormData)
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update pet');
      }

      // Success - redirect to pet details
      router.push(`/pets/${petId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push(`/pets/${petId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full border-[#3479ba] animate-spin"></div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Error Loading Pet
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/my-dashboard')}
                  className="px-4 py-2 text-white bg-[#3479ba] rounded-md hover:bg-[#2a5d8a] transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet || !isOwner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Access denied or pet not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-6 text-[#3479ba] hover:text-[#2a5d8a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Pet Details
          </button>

          <h1 className="text-[#001e4c] pt-2 font-bold leading-none text-left text-[36px] tracking-tight mb-8">
            Edit {pet.name}
          </h1>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload Section */}
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-4">
                Pet Photo
              </label>
              
              <div className="flex flex-col space-y-4">
                {/* Current Photo or Preview */}
                <div className="flex items-center space-x-4">
                  {photoPreview ? (
                    // Show new photo preview
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="New photo preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-[#3479ba]"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : pet.photo?.url ? (
                    // Show current photo
                    <div className="relative">
                      <img
                        src={pet.photo.url}
                        alt={pet.name}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Current
                      </div>
                    </div>
                  ) : (
                    // No photo placeholder
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-gray-500 text-sm text-center">No photo</span>
                    </div>
                  )}
                  
                  {/* Upload button */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#3479ba] rounded-md shadow-sm text-xl font-medium text-[#3479ba] bg-white hover:bg-[#3479ba] hover:text-white transition-colors"
                    >
                      {photoPreview ? 'Change Photo' : pet.photo?.url ? 'Update Photo' : 'Add Photo'}
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xl font-medium text-gray-700">
                Pet Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              />
            </div>
            
            <div>
              <label htmlFor="species" className="block text-xl font-medium text-gray-700">
                Species *
              </label>
              <select
                id="species"
                name="species"
                required
                value={formData.species}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="another">Another</option>
              </select>
            </div>

            <div>
              <label htmlFor="breed" className="block text-xl font-medium text-gray-700">
                Breed
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-xl font-medium text-gray-700">
                Sex
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="age" className="block text-xl font-medium text-gray-700">
                Age (years)
              </label>
              <input
                type="number"
                id="age"
                name="age"
                min="0"
                value={formData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              />
            </div>

            <div>
              <label htmlFor="height" className="block text-xl font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                min="0"
                step="0.1"
                value={formData.height}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-xl font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] text-xl"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="px-4 py-2 text-xl text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xl text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2a5d8a] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetPage;