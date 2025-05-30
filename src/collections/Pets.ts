import { CollectionConfig } from "payload";


export const Pet: CollectionConfig = {
    slug: 'pets',
    access: {
      read: ({ req }) => {
        if (!req.user) return false;
        // Allow authenticated users to read pets
        return true;
      },
      create: ({ req }) => {
        if (!req.user) return false;
        // Allow admins and pet owners to create pets
        return req.user.roles === 'admin' || req.user.roles === 'petOwner';
      },
      update: ({ req, id: _id }) => {
        if (!req.user) return false;
        if (req.user.roles === 'admin') return true;
        
        // Check if the user is the pet owner
        return {
          petOwner: {
            equals: req.user.id,
          },
        };
      },
      delete: ({ req, id: _id }) => {
        if (!req.user) return false;
        if (req.user.roles === 'admin') return true;
        
        // Check if the user is the pet owner
        return {
          petOwner: {
            equals: req.user.id,
          },
        };
      },
    },
      admin: {
        defaultColumns: ['name', 'species', 'age'],
        useAsTitle: 'name',
        group: 'Pets',
      },
      
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Pet Photo',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Pet Name',
        },
        {
          name: 'species',
          type: 'select',
          options: [
            {
              label: 'Dog',
              value: 'dog',
            },
            {
              label: 'Cat',
              value: 'cat',
            },
            {
              label: 'Another',
              value: 'another',
            },
          ],
          required: true,
          label: 'Species',
        },
        {
          name: 'breed',
          type: 'text',
          required: false,
          label: 'Breed',
        },
        {
          name: 'sex',
          type: 'select',
          options: [
            {
              label: 'Male',
              value: 'male',
            },
            {
              label: 'Female',
              value: 'female',
            },
          ],
          required: false,
          label: 'Sex',
        },
        {
          name: 'age',
          type: 'number',
          admin: {
            description: 'Age in years',
          },
          label: 'Age',
        },
        {
            name: 'height',
            type: 'number',
            admin: {
              description: 'Height in centimeters',
            },
            label: 'Height',
        },
        {
          name: 'weight',
          type: 'number',
          admin: {
            description: 'Weight in kilograms',
          },
          label: 'Weight',
        },
        {
          name: 'petOwner',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          label: 'Pet Owner',
          // Only show this field for admins, hide for regular users
          admin: {
            condition: ({ user }) => user?.roles === 'admin',
          },
          // Set default value to current user
          defaultValue: ({ user }) => user?.id,
          // Hooks to ensure proper owner assignment
          hooks: {
            beforeChange: [
              ({ value, req, operation }) => {
                // If creating a new pet and value is not set, use the current user
                if (operation === 'create' && !value && req.user) {
                  return req.user.id;
                }
                return value;
              },
            ],
          },
        },
        {
          name: 'petCarer',
          type: 'relationship',
          relationTo: 'users',
          required: false,
          label: 'Pet Carer',
        },
        // Medical Record
        {
          name: 'medicalRecord',
          type: 'group',
          label: 'Medical Record',
          fields: [
            {
              name: 'vaccines',
              type: 'array',
              label: 'Vaccines',
              fields: [
                {
                  name: 'vaccineType',
                  type: 'text',
                  required: true,
                  label: 'Vaccine Type',
                },
                {
                  name: 'administrationDate',
                  type: 'date',
                  label: 'Administration Date',
                },
                {
                  name: 'nextDosis',
                  type: 'date',
                  label: 'Next Dose Date',
                },
                {
                  name: 'lotNumber',
                  type: 'text',
                  label: 'Lot Number',
                }
              ],
            },
            {
              name: 'deworming',
              type: 'array',
              label: 'Deworming Treatments',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    {
                      label: 'Internal',
                      value: 'internal',
                    },
                    {
                      label: 'External',
                      value: 'external',
                    },
                  ],
                  label: 'Deworming Type',
                },
                {
                  name: 'antiparasitic',
                  type: 'text',
                  label: 'Antiparasitic Name',
                },
                {
                  name: 'administrationDate',
                  type: 'date',
                  label: 'Administration Date',
                },
                {
                  name: 'frequency',
                  type: 'text',
                  admin: {
                    description: 'For example: "Every 3 months"',
                  },
                  label: 'Frequency',
                }
              ],
            },
            {
              name: 'vetAppointments',
              type: 'array',
              label: 'Veterinary Appointments',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  label: 'Appointment Date',
                },
                {
                  name: 'reason',
                  type: 'textarea',
                  label: 'Reason for Visit',
                },
                {
                  name: 'diagnostic',
                  type: 'textarea',
                  label: 'Diagnosis',
                },
                {
                  name: 'treatment',
                  type: 'textarea',
                  label: 'Treatment Plan',
                }
              ],
            },
            {
              name: 'surgicalProcedures',
              type: 'array',
              label: 'Surgical Procedures',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                  required: true,
                  label: 'Procedure Type',
                },
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  label: 'Procedure Date',
                },
                {
                  name: 'complications',
                  type: 'textarea',
                  label: 'Complications',
                },
                {
                  name: 'medicationPostoperative',
                  type: 'textarea',
                  label: 'Postoperative Medication',
                }
              ],
            },
            {
              name: 'allergies',
              type: 'array',
              label: 'Allergies',
              fields: [
                {
                  name: 'allergie',
                  type: 'text',
                  required: true,
                  label: 'Allergy',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Description',
                }
              ],
            },
            {
              name: 'laboratoryTests',
              type: 'array',
              label: 'Laboratory Tests',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    {
                      label: 'Blood tests',
                      value: 'blood',
                    },
                    {
                      label: 'Urine analysis',
                      value: 'urine',
                    },
                    {
                      label: 'X-ray',
                      value: 'x-ray',
                    },
                    {
                      label: 'Ultrasound',
                      value: 'ultrasound',
                    },
                    {
                      label: 'Another',
                      value: 'another',
                    },
                  ],
                  required: true,
                  label: 'Test Type',
                },
                {
                  name: 'date',
                  type: 'date',
                  label: 'Test Date',
                },
                {
                  name: 'results',
                  type: 'textarea',
                  label: 'Test Results',
                },
                {
                  name: 'resultsDocs',
                  type: 'upload',
                  relationTo: 'documents',
                  label: 'Result Documents',
                }
              ],
            },
            {
              name: 'medicalTreatments',
              type: 'array',
              label: 'Medical Treatments',
              fields: [
                {
                  name: 'medicine',
                  type: 'text',
                  required: true,
                  label: 'Medicine',
                },
                {
                  name: 'dose',
                  type: 'text',
                  label: 'Dose',
                },
                {
                  name: 'duration',
                  type: 'text',
                  label: 'Duration',
                },
                {
                  name: 'aditionalTerapy',
                  type: 'textarea',
                  admin: {
                    description: 'Physiotherapy, special diets, etc.',
                  },
                  label: 'Additional Therapy',
                }
              ],
            },
            {
              name: 'evolutionTracking',
              type: 'array',
              label: 'Evolution Tracking',
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  label: 'Date',
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  label: 'Notes',
                },
                {
                  name: 'treatmentChanges',
                  type: 'textarea',
                  label: 'Treatment Changes',
                }
              ],
            },
          ],
        },
        // Daily cares
        {
          name: 'dailyCare',
          type: 'group',
          label: 'Daily Care',
          fields: [
            {
              name: 'feeding',
              type: 'group',
              label: 'Feeding',
              fields: [
                {
                  name: 'foodType',
                  type: 'text',
                  label: 'Food Type',
                },
                {
                  name: 'dailyQuantity',
                  type: 'text',
                  label: 'Daily Quantity',
                },
                {
                  name: 'frequency',
                  type: 'text',
                  admin: {
                    description: 'For example: "twice a day"',
                  },
                  label: 'Frequency',
                },
                {
                  name: 'specialNeeds',
                  type: 'textarea',
                  label: 'Special Needs',
                }
              ],
            },
            {
              name: 'hygiene',
              type: 'group',
              label: 'Hygiene',
              fields: [
                {
                  name: 'bathFrequency',
                  type: 'text',
                  label: 'Bath Frequency',
                },
                {
                  name: 'brushFrequency',
                  type: 'text',
                  label: 'Brush Frequency',
                },
                {
                  name: 'dentalCleaningFrequency',
                  type: 'text',
                  label: 'Dental Cleaning Frequency',
                },
                {
                  name: 'cleaningEars',
                  type: 'text',
                  label: 'Ear Cleaning Frequency',
                },
                {
                  name: 'cuttingNails',
                  type: 'text',
                  label: 'Nail Cutting Frequency',
                },
                {
                  name: 'notes',
                  type: 'textarea',
                  label: 'Notes',
                }
              ],
            },
            {
              name: 'exercise',
              type: 'group',
              label: 'Exercise',
              fields: [
                {
                  name: 'excerciseType',
                  type: 'text',
                  admin: {
                    description: 'Walks, games, etc.',
                  },
                  label: 'Exercise Type',
                },
                {
                  name: 'duration',
                  type: 'text',
                  label: 'Duration',
                },
                {
                  name: 'frequency',
                  type: 'text',
                  label: 'Frequency',
                },
                {
                  name: 'observations',
                  type: 'textarea',
                  label: 'Observations',
                }
              ],
            },
          ],
        },
        // Reminders
        {
          name: 'reminders',
          type: 'array',
          label: 'Reminders',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                {
                  label: 'Vaccine',
                  value: 'vaccine',
                },
                {
                  label: 'Deworming',
                  value: 'deworming',
                },
                {
                  label: 'Vet appointment',
                  value: 'vetAppointment',
                },
                {
                  label: 'Medication',
                  value: 'medication',
                },
                {
                  label: 'Haircut',
                  value: 'haircut',
                },
                {
                  label: 'Bath',
                  value: 'bath',
                },
                {
                  label: 'Other',
                  value: 'othewr',
                },
              ],
              required: true,
              label: 'Reminder Type',
            },
            {
              name: 'date',
              type: 'date',
              required: true,
              label: 'Date',
            },
            {
              name: 'time',
              type: 'text',
              label: 'Time',
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
            },
           
          ],
        },
        {
          name: 'qrLink',
          type: 'text',
          admin: {
            description: 'Link to QR code of medical history',
          },
          label: 'QR Code Link',
        },
      ],
      hooks: {
        beforeValidate: [
          ({ data, req, operation }) => {
            if (!data) {
              return data;
            }
            
            if (operation === 'create' && !data.petOwner && req.user) {
              return {
                ...data,
                petOwner: req.user.id,
              };
            }
            return data;
          },
        ],
        beforeChange: [
          ({ data, req, operation }) => {
            if (!data) {
              return data;
            }
            
            if (operation === 'create' && !data.petOwner && req.user) {
              return {
                ...data,
                petOwner: req.user.id,
              };
            }
            return data;
          },
        ],
        afterChange: [
          async ({ req, doc, operation, context }) => {
            // Skip if we're already in a nested update to prevent circular updates
            if (context?.updatingRelationship) {
              return;
            }
    
            if ((operation === 'create' || operation === 'update') && doc.petOwner) {
              try {
                const ownerId = typeof doc.petOwner === 'object' ? doc.petOwner.id : doc.petOwner;
                
                // Get the user first
                const userDoc = await req.payload.findByID({
                  collection: 'users',
                  id: ownerId,
                  depth: 0,
                });
                
                // Extract current ownedPets
                const currentOwnedPets = userDoc.ownedPets || [];
                const currentPetIds = currentOwnedPets.map(pet => 
                  typeof pet === 'object' ? pet.id : pet
                );
                
                // Only update if the pet is not already in the list
                if (!currentPetIds.includes(doc.id)) {
                  // Update the user with a context flag to prevent circular updates
                  await req.payload.update({
                    collection: 'users',
                    id: ownerId,
                    data: {
                      ownedPets: [...currentPetIds, doc.id],
                    },
                    depth: 0,
                    context: {
                      updatingRelationship: true,
                    },
                  });
                  
                  console.log(`Successfully added pet ${doc.id} to user ${ownerId}'s ownedPets array`);
                }
              } catch (error) {
                console.error('Error updating user\'s ownedPets array:', error);
              }
            }
          },
        ],
        // If you have a beforeDelete hook, you should also remove the pet from the user's ownedPets array
        beforeDelete: [
          async ({ req, id }) => {
            try {
              // First, get the pet to find its owner
              const pet = await req.payload.findByID({
                collection: 'pets',
                id,
              });
              
              if (pet && pet.petOwner) {
                const ownerId = typeof pet.petOwner === 'object' ? pet.petOwner.id : pet.petOwner;
                
                // Get the user first
                const userDoc = await req.payload.findByID({
                  collection: 'users',
                  id: ownerId,
                  depth: 0,
                });
                
                // Extract current ownedPets
                const currentOwnedPets = userDoc.ownedPets || [];
                const currentPetIds = currentOwnedPets.map(pet => 
                  typeof pet === 'object' ? pet.id : pet
                );
                
                // Remove the pet from the array
                const updatedPetIds = currentPetIds.filter(petId => petId !== id);
                
                // Only update if the pet is actually in the list
                if (currentPetIds.length !== updatedPetIds.length) {
                  // Update the user
                  await req.payload.update({
                    collection: 'users',
                    id: ownerId,
                    data: {
                      ownedPets: updatedPetIds,
                    },
                    depth: 0,
                    context: {
                      updatingRelationship: true,
                    },
                  });
                  
                  console.log(`Successfully removed pet ${id} from user ${ownerId}'s ownedPets array`);
                }
              }
            } catch (error) {
              console.error('Error removing pet from user\'s ownedPets array:', error);
            }
          },
        ],
      },
    }