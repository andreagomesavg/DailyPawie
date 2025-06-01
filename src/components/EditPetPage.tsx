
"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // ← AÑADIDO: Usar Next.js Image

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
    alt?: string;
    sizes?: {
      thumbnail?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  };
}

const EditPetPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isNewImageSelected, setIsNewImageSelected] = useState(false); // ← AÑADIDO
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
        
        // Set preview image - prefer thumbnail for preview, fallback to main URL
        if (petData.photo) {
          const imageUrl = petData.photo.sizes?.thumbnail?.url || petData.photo.url;
          setPreviewImage(imageUrl);
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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (límite más estricto: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setIsNewImageSelected(true);
      setError(null);
      
      try {
        // ✅ OPTIMIZACIÓN: Comprimir imagen antes de mostrar preview
        let processedFile = file;
        
        // Comprimir si es muy grande
        if (file.size > 1024 * 1024) { // Si es mayor a 1MB
          processedFile = await compressImage(file, 800, 0.8);
          console.log(`Image compressed: ${file.size} -> ${processedFile.size} bytes`);
        }
        
        // Create a preview of the processed image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(processedFile);
        
        // Store the processed file for upload
        if (e.target) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(processedFile);
          e.target.files = dataTransfer.files;
        }
        
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Error processing image. Please try again.');
      }
    } else {
      // If no file is selected, revert to the pet's original photo
      setIsNewImageSelected(false);
      const originalImage = pet?.photo?.sizes?.thumbnail?.url || pet?.photo?.url || null;
      setPreviewImage(originalImage);
    }
  };

// ✅ AÑADIR función de compresión al componente
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = typeof window !== "undefined" ? new window.Image() : ({} as HTMLImageElement);

    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
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
      if (photoInput.files && photoInput.files[0] && isNewImageSelected) {
        console.log('Uploading new photo...', photoInput.files[0]);
        
        const photoFormData = new FormData();
        
        // Create a proper JSON object for the data field
        const mediaData = {
          alt: `Foto de ${formData.name.trim()}` || 'Pet photo'
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
          throw new Error('Failed to upload photo. Please try again.');
        }
  
        const photoData = await photoResponse.json();
        photoId = photoData.doc?.id || photoData.id;
        
        if (!photoId) {
          console.error('No photo ID returned:', photoData);
          throw new Error('Photo upload succeeded but no ID was returned');
        }
      }
  
      // Prepare pet data for update
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed?.trim() || undefined,
        sex: formData.sex || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseInt(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
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
  
      // Success! Redirect back to pet detail page
      router.push(`/pets/${params.id}`);
      
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the pet');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/pets/${params.id}`);
  };

  // Helper function to get the best image URL for display
  const getDisplayImageUrl = () => {
    if (!pet?.photo) return null;
    return pet.photo.sizes?.medium?.url || pet.photo.url;
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
            {/* Photo section - OPTIMIZADO */}
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-2">Pet Photo</label>
              <div className="flex items-center space-x-6">
                {previewImage && (
                  <div className="flex-shrink-0 w-32 h-32 overflow-hidden rounded-lg border border-gray-200">
                    {isNewImageSelected ? (
                      // For new selected images, use regular img tag
                      <img
                        src={previewImage}
                        alt="Pet preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      // For existing pet photos, use Next.js Image for optimization
                      <Image
                        src={previewImage}
                        alt={pet?.photo?.alt || `Foto de ${pet?.name}`}
                        width={128}
                        height={128}
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    name="photo"
                    id="photo"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-[#3479ba] hover:file:bg-blue-100 file:cursor-pointer"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, PNG, WebP or GIF up to 10MB. Only upload if you want to change the current photo.
                  </p>
                  {isNewImageSelected && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ New image selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic information */}
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Pet Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="species" className="block text-sm font-medium text-gray-700">
                  Species *
                </label>
                <select
                  name="species"
                  id="species"
                  required
                  value={formData.species}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                >
                  <option value="">Select species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="another">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  id="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="sex"
                  id="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  min="0"
                  max="50"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  id="height"
                  min="0"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                  autoComplete="off"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba] sm:text-sm"
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3479ba] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetPage;