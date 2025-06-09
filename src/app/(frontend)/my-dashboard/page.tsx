"use client"
import React, { useEffect, useState, useCallback } from 'react'; 
import { useRouter } from 'next/navigation';
import AllRemindersComponent from '@/components/AllPetReminders';
import {League_Spartan} from "next/font/google"
import { Mars, Venus, CircleAlert } from 'lucide-react';
import DiagonalArrow from '@/components/ui/diagonalRowIcon';
import { z } from 'zod';

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700", "500","600", "900"], 
  variable: "--font-spartan"
});

// Pet validation schema
const petSchema = z.object({
  photo: z
    .any()
    .refine((files) => files && files.length > 0, "Pet photo is required")
    .refine(
      (files) => files && files[0] && files[0].size <= 5000000,
      "File size should be less than 5MB"
    )
    .refine(
      (files) => files && files[0] && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(files[0].type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
  name: z
    .string()
    .min(1, "Pet name is required")
    .min(2, "Pet name must be at least 2 characters long")
    .max(50, "Pet name must be less than 50 characters"),
  species: z
    .string()
    .min(1, "Please select a species"),
  breed: z
    .string()
    .max(50, "Breed must be less than 50 characters")
    .optional(),
  sex: z
    .string()
    .optional(),
  age: z
    .number()
    .min(0, "Age must be 0 or greater")
    .max(50, "Age must be less than 50 years")
    .optional()
    .nullable(),
});

type PetData = {
  photo: FileList | null;
  name: string;
  species: string;
  breed: string;
  sex: string;
  age: string;
};

type ValidationErrors = Partial<Record<keyof PetData | 'form', string>>;

const validatePetForm = (data: PetData) => {
  try {
    const validationData = {
      photo: data.photo,
      name: data.name,
      species: data.species,
      breed: data.breed || undefined,
      sex: data.sex || undefined,
      age: data.age ? parseInt(data.age) : undefined,
    };
    
    petSchema.parse(validationData);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof PetData] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { form: 'Validation failed' } };
  }
};

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  age?: number;
  photo?: {
    url: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string;
  ownedPets?: Array<Pet | string>;
  caredPets?: Array<Pet | string>;
}

const PetCreationForm = ({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<PetData>({
    photo: null,
    name: '',
    species: '',
    breed: '',
    sex: '',
    age: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: fileInput.files
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user changes it
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  // Enhanced file validation function
  const validateFile = (file: File) => {
    const errors = [];
    
    // Size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size must be less than 5MB');
    }
    
    // Type check
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be JPG, PNG, or WebP format');
    }
    
    // Additional checks
    if (file.name.length > 255) {
      errors.push('Filename too long');
    }
    
    if (file.size === 0) {
      errors.push('File appears to be empty');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Simple photo upload - reverting to basic local version
  const uploadPhoto = async (file: File, altText: string) => {
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', altText);
    
    // Debug what we're sending
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Could not read response text';
        }
        
        console.error('Upload failed details:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText,
          url: response.url,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Try to parse as JSON for better error info
        if (errorText) {
          try {
            const errorObj = JSON.parse(errorText);
            console.error('Parsed error object:', errorObj);
            
            // Check for validation errors
            if (errorObj.errors && errorObj.errors[0]?.data?.errors) {
              const validationErrors = errorObj.errors[0].data.errors;
              const errorMessages = validationErrors.map((err: any) => `${err.label}: ${err.message}`).join(', ');
              throw new Error(`Validation failed: ${errorMessages}`);
            }
          } catch (parseError) {
            console.log('Could not parse error as JSON');
          }
        }
        
        throw new Error(`Upload failed: ${response.status} - ${errorText || 'No error details'}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      return data;
      
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setStatusMessage("Creating your pet...");

    // Validate form data
    const validation = validatePetForm(formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      setIsSubmitting(false);
      setStatusMessage(null);
      return;
    }

    try {
      let photoId = null;

      if (formData.photo && formData.photo[0]) {
        const file = formData.photo[0];
        
        // Create a more descriptive alt text with pet name and timestamp ID
        const timestamp = Date.now();
        const petName = formData.name.trim() || 'Pet';
        const altText = `Photo of ${petName} - ID: ${timestamp}`;
        
        setStatusMessage("Uploading photo...");
        
        // Basic file validation
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ photo: 'File size must be less than 5MB' });
          setIsSubmitting(false);
          setStatusMessage(null);
          return;
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setErrors({ photo: 'File must be JPG, PNG, or WebP format' });
          setIsSubmitting(false);
          setStatusMessage(null);
          return;
        }
        
        try {
          const uploadResult = await uploadPhoto(file, altText);
          photoId = uploadResult.doc?.id || uploadResult.id;
          
          if (!photoId) {
            console.error('No photo ID in response:', uploadResult);
            throw new Error('Photo upload completed but no ID was returned');
          }
          
          console.log('✅ Photo uploaded successfully with ID:', photoId);
        } catch (photoError: any) {
          console.error('💥 Photo upload error:', photoError);
          throw new Error(`Failed to upload photo: ${photoError.message}`);
        }
      }

      setStatusMessage("Preparing pet data...");
      const userResponse = await fetch('/api/users/me', {
        credentials: 'include',
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }
      
      const userData = await userResponse.json();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('Could not get user ID');
      }

      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed?.trim() || undefined,
        sex: formData.sex || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        photo: photoId || undefined, 
        petOwner: userId 
      };

      console.log('Creating pet with data:', petData);
      setStatusMessage("Saving pet...");

      try {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(petData),
          credentials: 'include',
        });

        console.log('Pet creation response status:', response.status);
        console.log('Pet creation response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ Pet created successfully:', responseData);
          
          setStatusMessage("Pet created successfully! 🎉");
          await new Promise(resolve => setTimeout(resolve, 1500));
          onSuccess();
          return;
        } else {
          // Get detailed error information
          let errorText;
          try {
            errorText = await response.text();
          } catch (e) {
            errorText = 'Could not read error response';
          }
          
          console.error('❌ Pet creation failed:', {
            status: response.status,
            statusText: response.statusText,
            responseText: errorText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
          });
          
          // Try to parse error as JSON for better error message
          let errorMessage = `Failed to create pet: ${response.status}`;
          if (errorText) {
            try {
              const errorObj = JSON.parse(errorText);
              console.error('Parsed error object:', errorObj);
              
              if (errorObj.errors && errorObj.errors[0]?.data?.errors) {
                const validationErrors = errorObj.errors[0].data.errors;
                const errorMessages = validationErrors.map((err: any) => `${err.label}: ${err.message}`).join(', ');
                errorMessage = `Validation failed: ${errorMessages}`;
              } else if (errorObj.message) {
                errorMessage = errorObj.message;
              } else {
                errorMessage = errorText;
              }
            } catch (parseError) {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }
      } catch (fetchError: any) {
        console.error('❌ Pet creation fetch error:', fetchError);
        throw fetchError;
      }

    } catch (err: any) {
      console.error('💥 Final error:', err);
      
      const errorMessage = err.message || err.toString();
      console.error('Error message:', errorMessage);
      
      // Show the actual error to the user
      setErrors({ 
        form: errorMessage.includes('upload') 
          ? 'Failed to upload photo. Please try again.' 
          : `Failed to create pet: ${errorMessage}`
      });
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Add New Pet</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4" noValidate>
        {errors.form && (
          <div className="flex flex-row px-3 py-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
            <CircleAlert className="w-5 h-5" />
            <p className="my-0 text-base font-medium">{errors.form}</p>
          </div>
        )}

        <div>
          <label htmlFor="photo" className="block text-xl font-medium text-gray-700">Pet Photo</label>
          <input 
            type="file" 
            name="photo" 
            id="photo" 
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            className={`box-border block w-full px-3 py-2 mt-1 border ${errors.photo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
            autoComplete="off"
          />
          {errors.photo && (
            <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
              <CircleAlert className="w-4 h-4" />
              <p className="my-0 text-sm">{errors.photo}</p>
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: JPG, PNG, WebP. Max size: 5MB
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-xl font-medium text-gray-700">Pet Name</label>
          <input 
            type="text" 
            name="name" 
            id="name" 
            value={formData.name}
            onChange={handleChange}
            className={`box-border block w-full px-3 py-2 mt-1 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
            autoComplete="off"
            placeholder="Enter pet name"
          />
          {errors.name && (
            <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
              <CircleAlert className="w-4 h-4" />
              <p className="my-0 text-sm">{errors.name}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="species" className="block text-xl font-medium text-gray-700">Species</label>
          <select 
            name="species" 
            id="species" 
            value={formData.species}
            onChange={handleChange}
            className={`box-border block w-full px-3 py-2 mt-1 border ${errors.species ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
            autoComplete="off"
          >
            <option value="">Select species</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="another">Another</option>
          </select>
          {errors.species && (
            <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
              <CircleAlert className="w-4 h-4" />
              <p className="my-0 text-sm">{errors.species}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="breed" className="block text-xl font-medium text-gray-700">Breed (Optional)</label>
          <input 
            type="text" 
            name="breed" 
            id="breed" 
            value={formData.breed}
            onChange={handleChange}
            className={`box-border block w-full px-3 py-2 mt-1 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
            autoComplete="off"
            placeholder="Enter breed (optional)"
          />
          {errors.breed && (
            <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
              <CircleAlert className="w-4 h-4" />
              <p className="my-0 text-sm">{errors.breed}</p>
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor="sex" className="block text-xl font-medium text-gray-700">Sex (Optional)</label>
            <select 
              name="sex" 
              id="sex"
              value={formData.sex}
              onChange={handleChange}
              className={`box-border block w-full px-3 py-2 mt-1 border ${errors.sex ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
              autoComplete="off"
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.sex && (
              <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                <CircleAlert className="w-4 h-4" />
                <p className="my-0 text-sm">{errors.sex}</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block text-xl font-medium text-gray-700">Age (years, optional)</label>
            <input 
              type="number" 
              name="age" 
              id="age" 
              min="0" 
              max="50"
              value={formData.age}
              onChange={handleChange}
              className={`box-border block w-full px-3 py-2 mt-1 border ${errors.age ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#3479ba] focus:border-[#3479ba]`}
              autoComplete="off"
              placeholder="Enter age"
            />
            {errors.age && (
              <div className="flex flex-row px-3 py-2 mt-2 text-red-700 rounded-md bg-red-50 items-center gap-2">
                <CircleAlert className="w-4 h-4" />
                <p className="my-0 text-sm">{errors.age}</p>
              </div>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="text-xl font-medium text-blue-600">{statusMessage}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-4 py-2 text-xl font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2968a3] disabled:bg-opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

const UserDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);

  const handleViewAllReminders = () => {
    router.push('/reminders');
  };

  const fetchPetsData = useCallback(async (petIds: Array<string | Pet>) => {
    setLoadingPets(true);
    try {
      const ids = petIds.map(pet => typeof pet === 'object' ? pet.id : pet);
      
      console.log('Fetching details for pet IDs:', ids);
      
      const petsData = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await fetch(`/api/pets/${id}`, {
              credentials: 'include',
            });
            
            if (!response.ok) {
              console.error(`Failed to fetch pet ${id}: ${response.statusText}`);
              return null;
            }
            
            const data = await response.json();
            return data;
          } catch (error) {
            console.error(`Error fetching pet ${id}:`, error);
            return null;
          }
        })
      );
      
      const validPets = petsData.filter(pet => pet !== null);
      console.log('Fetched pets data:', validPets);
      setPets(validPets);
    } catch (err) {
      console.error('Error fetching pets data:', err);
    } finally {
      setLoadingPets(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      
      if (data.user?.roles === 'admin') {
        router.push('/admin');
        return;
      }

      setUser(data.user);

      if (data.user?.ownedPets && data.user.ownedPets.length > 0) {
        await fetchPetsData(data.user.ownedPets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, fetchPetsData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePetCreated = () => {
    setShowAddPetForm(false);
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderPetCard = (pet: Pet) => {
    if (!pet || !pet.id) return null;
    
    return (
      <div key={pet.id} className="overflow-hidden bg-white rounded-lg shadow cursor-pointer transition-transform duration-300 hover:scale-[1.03]" onClick={() => router.push(`/pets/${pet.id}`)}>
        {pet.photo && (
          <img
            src={pet.photo.url}
            alt={pet.name}
            className="object-cover w-full h-[350px]"
          />
        )}
        <div className="px-4 py-5 sm:p-6">
          <div className='flex flex-row items-center '>
            <h3 className="text-[42px] font-semibold text-black-500">{pet.name}</h3>
            {pet.sex && (
              <span className="ml-2">
                {pet.sex.toLowerCase() === 'male' ? (
                  <Mars size={28} className="text-blue-500" />
                ) : pet.sex.toLowerCase() === 'female' ? (
                  <Venus size={28} className="text-pink-500" />
                ) : null}
              </span>
            )}
          </div>
          <p className="mt-1 mb-0 text-xl text-gray-500">
            {pet.species} {pet.breed && `- ${pet.breed}`}
          </p>
          {pet.age && (
            <p className="m-0 text-xl text-gray-500">Age: {pet.age} years</p>
          )}
        </div>
        <div className="flex justify-center px-4 py-4 bg-gray-50 sm:px-6">
          <div 
            className="no-underline text-[18px] hover:text-white group block transition-all duration-200 hover:-translate-y-1 bg-white border-none"
            onClick={() => router.push(`/pets/${pet.id}`)}
          >
            <div className="flex flex-row mx-auto py-[4px] pl-[35px] pr-[4px] gap-[10px] border rounded-full items-center transition-all bg-[#3479ba] hover:bg-white hover:text-[var(--primary)] text-white font-semibold hover:cursor-pointer" >
              <div className="uppercase">
                Details
              </div>
              <div className="flex items-center justify-center rounded-full w-[40px] h-[40px] transition-all bg-white group-hover:bg-[var(--primary)]">
                <DiagonalArrow
                  width={24} 
                  height={24} 
                  color="white"
                  className="hidden group-hover:block"
                />
                <DiagonalArrow
                  width={24} 
                  height={24} 
                  color="var(--primary)"
                  className=" group-hover:hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8 ${leagueSpartan.className}`}>
      <div className="mx-auto max-w-7xl">
        <AllRemindersComponent 
          userPets={pets} 
          isOwner={true}
          maxReminders={3}
          showViewAll={true}
          onViewAllClick={handleViewAllReminders}
        />
        
        {user.roles === 'petOwner' && (
          <div className="mb-6 pt-[100px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] text-[#001e4c] font-semibold`}>My Pets</h2>
              <button
                onClick={() => setShowAddPetForm(true)}
                className="z-10 px-6 py-2 mt-2 rounded-md font-semibold text-xl 
                     text-white bg-[#3479ba] 
                     border-2 border-transparent
                     hover:bg-[#def1ff] hover:text-[#3479ba] hover:border-[#3479ba]
                     transition-all duration-300 hover:cursor-pointer "
              >
                Add New Pet
              </button>
            </div>

            {showAddPetForm ? (
              <PetCreationForm 
                onCancel={() => setShowAddPetForm(false)} 
                onSuccess={handlePetCreated}
              />
            ) : loadingPets ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-b-2 border-[#3479ba] rounded-full animate-spin"></div>
              </div>
            ) : pets.length > 0 ? (
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {pets.map(pet => renderPetCard(pet))}
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow">
                <p className="mb-4 text-gray-500">You haven&apos;t added any pets yet.</p>
                <button
                  onClick={() => setShowAddPetForm(true)}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2968a3]"
                >
                  Add Your First Pet
                </button>
              </div>
            )}
          </div>
        )}

        {user.roles === 'petCarer' && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Pets I Care For</h2>
            {user.caredPets && user.caredPets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-3 py-12 text-center bg-white rounded-lg shadow">
                  <p className="text-gray-500">Loading cared pets...</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-white rounded-lg shadow">
                <p className="mb-4 text-gray-500">You are not currently caring for any pets.</p>
                <button
                  onClick={() => router.push('/care-opportunities')}
                  className="inline-flex items-center px-4 py-2 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#2968a3]"
                >
                  Browse Care Opportunities
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;