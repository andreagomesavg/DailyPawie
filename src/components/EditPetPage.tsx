"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    id: string;
    url: string;
  };
}

const EditPetPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    sex: '',
    age: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        // First fetch current user to check permissions
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
        
        const userData = await userResponse.json();
        
        // Now fetch the pet details
        const petResponse = await fetch(`/api/pets/${params.id}`, {
          credentials: 'include',
        });
        
        if (!petResponse.ok) {
          throw new Error('Failed to fetch pet details');
        }
        
        const petData = await petResponse.json();
        setPet(petData);
        
        // Check if current user is the pet owner
        if (petData.petOwner) {
          const ownerId = typeof petData.petOwner === 'object' ? petData.petOwner.id : petData.petOwner;
          if (ownerId !== userData.user?.id && userData.user?.roles !== 'admin') {
            router.push('/my-dashboard');
            return;
          }
        }
        
        // Set form data
        setFormData({
          name: petData.name || '',
          species: petData.species || '',
          breed: petData.breed || '',
          sex: petData.sex || '',
          age: petData.age ? String(petData.age) : '',
          height: petData.height ? String(petData.height) : '',
          weight: petData.weight ? String(petData.weight) : '',
        });
        
        // Set preview image if exists
        if (petData.photo && petData.photo.url) {
          setPreviewImage(petData.photo.url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchPetData();
    }
  }, [params.id, router]);

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
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, revert to the pet's original photo
      setPreviewImage(pet?.photo?.url || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    const formElement = e.currentTarget;
    
    try {
      let photoId = pet?.photo?.id || null;
  
      // Handle photo upload if a new photo was selected
      const photoInput = formElement.querySelector('input[name="photo"]') as HTMLInputElement;
      if (photoInput.files && photoInput.files[0]) {
        console.log('Uploading new photo...', photoInput.files[0]);
        
        const photoFormData = new FormData();
        
        // Create a proper JSON object for the data field
        const mediaData = {
          alt: formData.name.trim() || 'Pet photo'
        };
        
        // Append the file and metadata
        photoFormData.append('file', photoInput.files[0]);
        photoFormData.append('alt', mediaData.alt);
        photoFormData.append('data', JSON.stringify(mediaData));
  
        const photoResponse = await fetch('/api/media', {
          method: 'POST',
          body: photoFormData,
          credentials: 'include',
        });
  
        if (!photoResponse.ok) {
          const errorText = await photoResponse.text();
          console.error('Photo upload failed:', errorText);
          throw new Error('Failed to upload photo');
        }
  
        const photoData = await photoResponse.json();
        photoId = photoData.doc?.id || photoData.id;
        
        if (!photoId) {
          console.error('No photo ID returned:', photoData);
          throw new Error('No photo ID returned from upload');
        }
      }
  
      // Prepare pet data for update
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || undefined,
        sex: formData.sex || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseInt(formData.weight) : undefined,
        photo: photoId || undefined
      };
  
      console.log('Updating pet with data:', petData);
  
      const response = await fetch(`/api/pets/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
        credentials: 'include',
      });
  
      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = 'Failed to update pet';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.errors?.[0]?.message || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
  
      // Redirect back to pet detail page
      router.push(`/pets/${params.id}`);
      
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/pets/${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push(`/pets/${params.id}`)}
          className="flex items-center mb-6 text-xl font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to Pet Details
        </button>

        <div className="p-6 bg-white rounded-lg shadow">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Pet Information</h1>
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {/* Photo section */}
            <div>
              <label className="block text-xl font-medium text-gray-700">Pet Photo</label>
              <div className="flex items-center mt-2 space-x-6">
                {previewImage && (
                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImage}
                      alt="Pet preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-xl text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xl file:font-medium file:bg-blue-50 file:text-[#3479ba] hover:file:bg-[#3479ba]"
                  />
                  <p className="mt-1 text-xl text-gray-500">
                    Only upload a new photo if you want to change the current one.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic information */}
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 gap-x-4 ">
              <div>
                <label htmlFor="name" className="block text-xl font-medium text-gray-700">
                  Pet Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="species" className="block text-xl font-medium text-gray-700">
                  Species
                </label>
                <select
                  name="species"
                  id="species"
                  required
                  value={formData.species}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                >
                  <option value="">Select species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="another">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="breed" className="block text-xl font-medium text-gray-700">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  id="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="sex" className="block text-xl font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="sex"
                  id="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
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
                  name="age"
                  id="age"
                  min="0"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-xl font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  id="height"
                  min="0"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-xl font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="box-border block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && <div className="text-xl text-red-600">{error}</div>}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba] disabled:bg-blue-400"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetPage;