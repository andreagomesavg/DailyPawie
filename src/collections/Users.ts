import type { CollectionConfig } from 'payload'

// Define interface for pet relationship
interface PetRelation {
  id: string;
  [key: string]: unknown;
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin:  ({ req }) => req.user && req.user.roles === 'admin'  ? true:false,
    create: () => true,
    delete: ({ req }) => req.user && req.user.roles === 'admin' || 'petOwner'  ? true:false,
    read:  ({ req }) => req.user && req.user.roles === 'admin' || 'petOwner'   ?  true:false,
    update: ({ req , id}) => {
      if (req.user?.roles === 'admin') return true;
      if (req.user && req.user.id === id) return true;
      return false;
    },
  },
  admin: {
    defaultColumns: ['name', 'username', 'email', 'roles'],
    useAsTitle: 'name',
    group: 'General'
  },
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin'
        },
        {
          label: 'PetOwner',
          value: 'petOwner'
        },
        {
          label: 'Pet Carer',
          value: 'petCarer',
        },
      ],
      required: true,
      admin: {
        description: 'Select user role'
      } 
    },
      {
        name: 'name',
        type: 'text',
        required: true,
        label: 'Name',
      },
      {
        name: 'username',
        type: 'text',
        required: true,
        unique: true,
        label: 'Username',
      },
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
        label: 'Email',
      },
      {
        name: 'phone',
        type: 'text',
        label: 'Phone Number',
        admin: {
          description: 'User phone number',
        },
      },
      {
        name: 'address',
        type: 'textarea',
        label: 'Address',
        admin: {
          description: 'User address',
        },
      },
      
      // Pets relationship
      {
        name: 'ownedPets',
        type: 'relationship',
        relationTo: 'pets',
        hasMany: true,
        label: 'Owned Pets',
        admin: {
          description: 'Pets owned by this user',
        },
      },
      {
        name: 'caredPets',
        type: 'relationship',
        relationTo: 'pets',
        hasMany: true,
        label: 'Cared Pets',
        admin: {
          description: 'Pets this user cares for',
          readOnly: true
        },
      },
      // Aditional Info
      {
        name: 'profileInfo',
        type: 'group',
        label: 'Profile Information',
        fields: [
          {
            name: 'avatar',
            type: 'upload',
            relationTo: 'media',
            label: 'Profile Picture',
          },
          {
            name: 'bio',
            type: 'textarea',
            label: 'Biography',
          },
          
        ],
      },
      // Certifications (to petCarers)
      {
        name: 'carerCertifications',
        type: 'array',
        label: 'Carer Certifications',
        admin: {
          condition: (data) => data?.roles === 'petCarer',
        },
        fields: [
          {
            name: 'certificationType',
            type: 'text',
            label: 'Certification Type',
            required: true,
          },
          {
            name: 'issuer',
            type: 'text',
            label: 'Issuing Organization',
          },
          {
            name: 'issueDate',
            type: 'date',
            label: 'Issue Date',
          },
          {
            name: 'expiryDate',
            type: 'date',
            label: 'Expiry Date',
          },
          {
            name: 'certificate',
            type: 'upload',
            relationTo: 'media',
            label: 'Certificate Document',
          },
        ],
      },
      // Availability 
      {
        name: 'availability',
        type: 'group',
        label: 'Availability',
        admin: {
          condition: (data) => data?.roles === 'petCarer',
        },
        fields: [
          {
            name: 'availableDays',
            type: 'select',
            hasMany: true,
            label: 'Available Days',
            options: [
              {
                label: 'Monday',
                value: 'monday',
              },
              {
                label: 'Tuesday',
                value: 'tuesday',
              },
              {
                label: 'Wednesday',
                value: 'wednesday',
              },
              {
                label: 'Thursday',
                value: 'thursday',
              },
              {
                label: 'Friday',
                value: 'friday',
              },
              {
                label: 'Saturday',
                value: 'saturday',
              },
              {
                label: 'Sunday',
                value: 'sunday',
              },
            ],
          },
          {
            name: 'startTime',
            type: 'text',
            label: 'Start Time',
            admin: {
              description: 'Format: HH:MM (24h)',
            },
          },
          {
            name: 'endTime',
            type: 'text',
            label: 'End Time',
            admin: {
              description: 'Format: HH:MM (24h)',
            },
          },
          {
            name: 'notes',
            type: 'textarea',
            label: 'Availability Notes',
          },
        ],
      },
      // Carer Statistics
      {
        name: 'carerStats',
        type: 'group',
        label: 'Carer Statistics',
        admin: {
          condition: (data) => data?.roles === 'petCarer',
        },
        fields: [
          {
            name: 'rating',
            type: 'number',
            min: 0,
            max: 5,
            label: 'Average Rating',
            admin: {
              readOnly: true,
              description: 'Average rating from 0-5 stars',
            },
          },
          {
            name: 'completedJobs',
            type: 'number',
            label: 'Completed Jobs',
            admin: {
              readOnly: true,
            },
          },
          {
            name: 'specialties',
            type: 'select',
            hasMany: true,
            label: 'Specialties',
            options: [
              {
                label: 'Dogs',
                value: 'dogs',
              },
              {
                label: 'Cats',
                value: 'cats',
              },
              {
                label: 'Birds',
                value: 'birds',
              },
              {
                label: 'Exotic Pets',
                value: 'exotic',
              },
              {
                label: 'Medical Care',
                value: 'medical',
              },
              {
                label: 'Training',
                value: 'training',
              },
            ],
          },
        ],
    },
   
  ],  hooks: {
    // This hook runs periodically to ensure the ownedPets field is synchronized
    afterRead: [
      async ({ req, doc }) => {
        // Skip in certain contexts to prevent excessive database queries
        if (req?.query?.depth === '0' || !doc.id) {
          return doc;
        }

        try {
          // Find all pets owned by this user
          const petsResult = await req.payload.find({
            collection: 'pets',
            where: {
              petOwner: {
                equals: doc.id,
              },
            },
            depth: 0,
          });

          // Get the IDs of all pets that have this user as owner
          const petIds = petsResult.docs.map(pet => pet.id);
          
          // If ownedPets doesn't match what's in the database, update it
          const currentPetIds = (doc.ownedPets || []).map((pet: PetRelation | string) => 
            typeof pet === 'object' ? pet.id : pet
          );
          
          // Check for differences between current and actual pet IDs
          const needsUpdate = petIds.length !== currentPetIds.length || 
            petIds.some(id => !currentPetIds.includes(id));
          
          // If we found differences, update the user's ownedPets field
          if (needsUpdate) {
            console.log(`Synchronizing ownedPets for user ${doc.id}`);
            console.log(`Current ownedPets: ${JSON.stringify(currentPetIds)}`);
            console.log(`Updated ownedPets: ${JSON.stringify(petIds)}`);
            
            // Important: We're updating the document being returned, not making a database change
            return {
              ...doc,
              ownedPets: petIds,
            };
          }
        } catch (error) {
          console.error(`Error synchronizing ownedPets for user ${doc.id}:`, error);
        }
        
        return doc;
      },
    ],
    // This hook runs when the user is explicitly updated
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'update') {
          try {
            // Find all pets owned by this user
            const petsResult = await req.payload.find({
              collection: 'pets',
              where: {
                petOwner: {
                  equals: doc.id,
                },
              },
              depth: 0,
            });
            
            // Get the IDs of all pets that have this user as owner
            const actualPetIds = petsResult.docs.map(pet => pet.id);
            
            // Get the IDs of the pets the user claims to own
            const claimedPetIds = (doc.ownedPets || []).map((pet: PetRelation | string) => 
              typeof pet === 'object' ? pet.id : pet
            );
            
            // Find pets that are in claimedPetIds but not in actualPetIds
            // These need to have their petOwner updated to this user
            const petsToAdd = claimedPetIds.filter((id: string) => !actualPetIds.map(String).includes(String(id)));
            
            // Update each pet to have this user as owner
            for (const petId of petsToAdd) {
              await req.payload.update({
                collection: 'pets',
                id: petId,
                data: { petOwner: doc.id },
                depth: 0,
                context: {
                  updatingRelationship: true,
                },
              });
              console.log(`Updated pet ${petId} to have owner ${doc.id}`);
            }
            
            // Find pets that are in actualPetIds but not in claimedPetIds
            // These should have their petOwner field cleared if the user no longer claims ownership
            const petsToRemove = actualPetIds.filter(id => !claimedPetIds.includes(id));
            
            // Remove this user as owner from these pets
            for (const petId of petsToRemove) {
              await req.payload.update({
                collection: 'pets',
                id: petId,
                data: { petOwner: null },  // Set to null rather than unsetting
                depth: 0,
                context: {
                  updatingRelationship: true,
                },
              });
              console.log(`Removed owner ${doc.id} from pet ${petId}`);
            }
          } catch (error) {
            console.error(`Error updating pet owners for user ${doc.id}:`, error);
          }
        }
      },
    ],
  },
}