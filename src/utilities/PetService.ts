import { Allergy, Deworming, LaboratoryTest, MedicalRecord, Reminder, SurgicalProcedure, Vaccine, VetAppointment } from '@/utilities/MedicalRecord';

// Interface for daily care data
interface DailyCareData {
  feeding?: {
    schedule?: string;
    foodType?: string;
    amount?: string;
    notes?: string;
  };
  exercise?: {
    type?: string;
    duration?: string;
    frequency?: string;
    notes?: string;
  };
  grooming?: {
    lastBath?: string;
    lastBrush?: string;
    nailTrim?: string;
    notes?: string;
  };
  medication?: {
    name?: string;
    dosage?: string;
    frequency?: string;
    notes?: string;
  };
  [key: string]: unknown;
}

// Service class to handle all pet-related API operations
export class PetService {
  /**
   * Fetch a pet by its ID
   */
  static async getPet(petId: string) {
    const response = await fetch(`/api/pets/${petId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pet: ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Update a pet's medical record
   */
  static async updateMedicalRecord(petId: string, medicalRecord: MedicalRecord) {
    console.log("Updating medical record:", JSON.stringify(medicalRecord, null, 2));
    
    // Clean up IDs to prevent validation errors
    const cleanedRecord = this.cleanupIds(medicalRecord);
    
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PATCH', // Use PATCH method for consistent API calls
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medicalRecord: cleanedRecord, // Wrap in medicalRecord property as expected by the API
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (_e) {
        errorText = await response.text();
      }
      throw new Error(`Failed to update pet: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Add a new vaccine to a pet's medical record
   */
  static async addVaccine(petId: string, vaccine: Vaccine) {
    console.log("Adding vaccine:", vaccine);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Generate a unique ID if one doesn't exist
    if (!vaccine.id) {
      vaccine.id = `vaccine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Create a new vaccines array with the added vaccine
    const vaccines = [...(medicalRecord.vaccines || []), vaccine];
    
    // Update the pet with the new medical record including the added vaccine
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      vaccines,
    });
  }
  
  /**
   * Update an existing vaccine in a pet's medical record
   */
  static async updateVaccine(petId: string, vaccineId: string, updatedVaccine: Vaccine) {
    console.log("Updating vaccine:", { petId, vaccineId, updatedVaccine });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const vaccines = [...(medicalRecord.vaccines || [])];
    
    // Find the index of the vaccine with the given ID
    const vaccineIndex = vaccines.findIndex(v => v.id === vaccineId);
    
    if (vaccineIndex === -1) {
      throw new Error(`Vaccine with ID ${vaccineId} not found`);
    }
    
    // Log the original vaccine for comparison
    console.log("Original vaccine:", vaccines[vaccineIndex]);
    
    // Make sure we preserve the ID and merge with existing data
    const completeUpdatedVaccine = {
      ...vaccines[vaccineIndex], // Start with all existing properties
      ...updatedVaccine, // Override with provided updates
      id: vaccineId // Ensure ID is preserved
    };
    
    console.log("Complete updated vaccine:", completeUpdatedVaccine);
    
    // Replace the vaccine at the specified index
    vaccines[vaccineIndex] = completeUpdatedVaccine;
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      vaccines,
    });
  }
  
  /**
   * Delete a vaccine from a pet's medical record
   */
  static async deleteVaccine(petId: string, vaccineId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const vaccines = [...(medicalRecord.vaccines || [])];
    
    // Filter out the vaccine with the given ID
    const updatedVaccines = vaccines.filter(vaccine => vaccine.id !== vaccineId);
    
    // Verify that a vaccine was actually removed
    if (updatedVaccines.length === vaccines.length) {
      throw new Error(`Vaccine with ID ${vaccineId} not found`);
    }
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      vaccines: updatedVaccines,
    });
  }
  
  /**
   * Add a new deworming treatment to a pet's medical record
   */
  static async addDeworming(petId: string, deworming: Deworming) {
    console.log("Adding deworming treatment:", deworming);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Validate deworming type - it must be one of the allowed values
    const allowedTypes = ['internal', 'external'];
    
    if (!allowedTypes.includes(deworming.type)) {
      throw new Error(`Invalid deworming type: "${deworming.type}". Must be one of: internal, external`);
    }
    
    // Generate a unique ID if one doesn't exist, with a prefix that's different from numeric IDs
    if (!deworming.id) {
      deworming.id = `dw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Create a new deworming array with the added treatment
    const dewormingArray = [...(medicalRecord.deworming || []), deworming];
    
    // Update the pet with the new medical record including the added deworming
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      deworming: dewormingArray,
    });
  }
  
  /**
   * Update an existing deworming treatment in a pet's medical record
   */
  static async updateDeworming(petId: string, dewormingId: string, updatedDeworming: Deworming) {
    console.log("Updating deworming:", { petId, dewormingId, updatedDeworming });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const dewormingArray = [...(medicalRecord.deworming || [])];
    
    // Find the index of the deworming with the given ID
    const dewormingIndex = dewormingArray.findIndex(d => String(d.id) === String(dewormingId));
    
    if (dewormingIndex === -1) {
      throw new Error(`Deworming treatment with ID ${dewormingId} not found`);
    }
    
    // Validate deworming type - it must be one of the allowed values
    const allowedTypes = ['internal', 'external'];
    
    if (updatedDeworming.type && !allowedTypes.includes(updatedDeworming.type)) {
      throw new Error(`Invalid deworming type: "${updatedDeworming.type}". Must be one of: internal, external`);
    }
    
    // Log the original deworming for comparison
    console.log("Original deworming:", dewormingArray[dewormingIndex]);
    
    // Make sure we preserve the ID and merge with existing data
    const completeUpdatedDeworming = {
      ...dewormingArray[dewormingIndex], // Start with all existing properties
      ...updatedDeworming, // Override with provided updates
      id: dewormingArray[dewormingIndex].id // Preserve original database ID
    };
    
    console.log("Complete updated deworming:", completeUpdatedDeworming);
    
    // Replace the deworming at the specified index
    dewormingArray[dewormingIndex] = completeUpdatedDeworming;
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      deworming: dewormingArray,
    });
  }
  
  /**
   * Delete a deworming treatment from a pet's medical record
   */
  static async deleteDeworming(petId: string, dewormingId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const dewormingArray = [...(medicalRecord.deworming || [])];
    
    // Filter out the deworming with the given ID
    const updatedDewormingArray = dewormingArray.filter(deworming => String(deworming.id) !== String(dewormingId));
    
    // Verify that a deworming was actually removed
    if (updatedDewormingArray.length === dewormingArray.length) {
      throw new Error(`Deworming treatment with ID ${dewormingId} not found`);
    }
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      deworming: updatedDewormingArray,
    });
  }
  static async addVetAppointment(petId: string, appointment: VetAppointment) {
    console.log("Adding vet appointment:", appointment);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Make sure the date field is included
    if (!appointment.date) {
      throw new Error('Appointment date is required');
    }
    
    // When creating a new appointment, explicitly set its ID to empty string
    // This signals to the backend that it should assign a new ID
    appointment.id = '';
    
    // Create a new appointments array with the added appointment
    const vetAppointments = [...(medicalRecord.vetAppointments || []), appointment];
    
    try {
      // Update the pet with the new medical record including the added appointment
      const updatedPet = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        vetAppointments,
      });
      
      console.log("Updated pet after adding appointment:", updatedPet);
      return updatedPet;
    } catch (error) {
      // If there was an error, it might be due to a duplicate request or ID conflict
      // Try refreshing the data to see if the appointment was actually added
      console.error("Error adding appointment:", error);
      
      // Wait a moment to ensure any database operations have time to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch fresh data
      const refreshedPet = await this.getPet(petId);
      console.log("Refreshed pet data after error:", refreshedPet);
      
      // If the appointment is now in the list, consider it successful
      const refreshedAppointments = refreshedPet.medicalRecord?.vetAppointments || [];
      const justAdded = refreshedAppointments.find((a: { date: string; reason: string | undefined; }) => 
        a.date === appointment.date && 
        (a.reason === appointment.reason || (!a.reason && !appointment.reason))
      );
      
      if (justAdded) {
        console.log("Appointment was added despite error, returning refreshed data");
        return refreshedPet;
      }
      
      // If not found after refresh, rethrow the original error
      throw error;
    }
  }
  
  /**
   * Update an existing vet appointment in a pet's medical record
   */
  static async updateVetAppointment(petId: string, appointmentId: string, updatedAppointment: VetAppointment) {
    console.log("Updating vet appointment:", { petId, appointmentId, updatedAppointment });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const vetAppointments = [...(medicalRecord.vetAppointments || [])];
    
    // Find the index of the appointment with the given ID
    const appointmentIndex = vetAppointments.findIndex(a => String(a.id) === String(appointmentId));
    
    if (appointmentIndex === -1) {
      throw new Error(`Vet appointment with ID ${appointmentId} not found`);
    }
    
    // Make sure the date field is included
    if (!updatedAppointment.date) {
      throw new Error('Appointment date is required');
    }
    
    // Log the original appointment for comparison
    console.log("Original appointment:", vetAppointments[appointmentIndex]);
    
    // Make sure we preserve the ID and merge with existing data
    const completeUpdatedAppointment = {
      ...vetAppointments[appointmentIndex], // Start with all existing properties
      ...updatedAppointment, // Override with provided updates
      id: vetAppointments[appointmentIndex].id // Preserve original database ID
    };
    
    console.log("Complete updated appointment:", completeUpdatedAppointment);
    
    // Replace the appointment at the specified index
    vetAppointments[appointmentIndex] = completeUpdatedAppointment;
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      vetAppointments,
    });
  }
  
  /**
   * Delete a vet appointment from a pet's medical record
   */
  static async deleteVetAppointment(petId: string, appointmentId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const vetAppointments = [...(medicalRecord.vetAppointments || [])];
    
    // Filter out the appointment with the given ID
    const updatedAppointments = vetAppointments.filter(appointment => String(appointment.id) !== String(appointmentId));
    
    // Verify that an appointment was actually removed
    if (updatedAppointments.length === vetAppointments.length) {
      throw new Error(`Vet appointment with ID ${appointmentId} not found`);
    }
    
    // Update the pet with the modified medical record
    return await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      vetAppointments: updatedAppointments,
    });
  }
  static async addSurgicalProcedure(petId: string, surgery: SurgicalProcedure) {
    console.log("Adding surgical procedure:", surgery);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Make sure the required fields are included
    if (!surgery.type) {
      throw new Error('Procedure type is required');
    }
    
    if (!surgery.date) {
      throw new Error('Procedure date is required');
    }
    
    // When creating a new procedure, explicitly set its ID to empty string
    // This signals to the backend that it should assign a new ID
    surgery.id = '';
    
    // Create a new procedures array with the added procedure
    const surgicalProcedures = [...(medicalRecord.surgicalProcedures || []), surgery];
    
    try {
      // Update the pet with the new medical record including the added procedure
      const updatedPet = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        surgicalProcedures,
      });
      
      console.log("Updated pet after adding surgical procedure:", updatedPet);
      return updatedPet;
    } catch (error) {
      // If there was an error, it might be due to a duplicate request or ID conflict
      // Try refreshing the data to see if the procedure was actually added
      console.error("Error adding surgical procedure:", error);
      
      // Wait a moment to ensure any database operations have time to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch fresh data
      const refreshedPet = await this.getPet(petId);
      console.log("Refreshed pet data after error:", refreshedPet);
      
      // If the procedure is now in the list, consider it successful
      const refreshedProcedures = refreshedPet.medicalRecord?.surgicalProcedures || [];
      const justAdded = refreshedProcedures.find((p: { date: string; type: string; }) => 
        p.date === surgery.date && 
        p.type === surgery.type
      );
      
      if (justAdded) {
        console.log("Procedure was added despite error, returning refreshed data");
        return refreshedPet;
      }
      
      // If not found after refresh, rethrow the original error
      throw error;
    }
  }
  /**
   * Update an existing surgical procedure in a pet's medical record
   */
  static async updateSurgicalProcedure(petId: string, surgeryId: string, updatedSurgery: SurgicalProcedure) {
    console.log("Updating surgical procedure:", { petId, surgeryId, updatedSurgery });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const surgicalProcedures = [...(medicalRecord.surgicalProcedures || [])];
    
    // Find the index of the procedure with the given ID
    const surgeryIndex = surgicalProcedures.findIndex(s => String(s.id) === surgeryId);
    
    if (surgeryIndex === -1) {
      throw new Error(`Surgical procedure with ID ${surgeryId} not found`);
    }
    
    // Log the original procedure for comparison
    console.log("Original surgical procedure:", surgicalProcedures[surgeryIndex]);
    
    // When updating, preserve the original ID from the database
    const completeUpdatedSurgery = {
      ...surgicalProcedures[surgeryIndex], // Start with all existing properties
      ...updatedSurgery, // Override with provided updates
      id: surgicalProcedures[surgeryIndex].id // Preserve original database ID
    };
    
    console.log("Complete updated surgical procedure:", completeUpdatedSurgery);
    
    // Replace the procedure at the specified index
    surgicalProcedures[surgeryIndex] = completeUpdatedSurgery;
    
    // Update the pet with the modified medical record
    const result = await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      surgicalProcedures,
    });
    
    // Return the updated pet data directly
    return result;
  }
  
  /**
   * Delete a surgical procedure from a pet's medical record
   */
  static async deleteSurgicalProcedure(petId: string, surgeryId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const surgicalProcedures = [...(medicalRecord.surgicalProcedures || [])];
    
    // Filter out the procedure with the given ID
    const updatedProcedures = surgicalProcedures.filter(surgery => String(surgery.id) !== surgeryId);
    
    // Verify that a procedure was actually removed
    if (updatedProcedures.length === surgicalProcedures.length) {
      throw new Error(`Surgical procedure with ID ${surgeryId} not found`);
    }
    
    // Update the pet with the modified medical record
    const result = await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      surgicalProcedures: updatedProcedures,
    });
    
    // Return the updated pet data directly
    return result;
  }
  static async addAllergy(petId: string, allergy: Allergy) {
    console.log("Adding allergy:", allergy);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Make sure the required allergie field is included
    if (!allergy.allergie) {
      throw new Error('Allergy name is required');
    }
    
    // When creating a new allergy, explicitly set its ID to empty string
    // This signals to the backend that it should assign a new ID
    allergy.id = '';
    
    // Check if we already have this allergy (to prevent duplicates)
    const existingAllergies = medicalRecord.allergies || [];
    const existingAllergy = existingAllergies.find((a: { allergie: string; }) => 
      a.allergie === allergy.allergie
    );
    
    if (existingAllergy) {
      console.log("Allergy already exists, returning existing data");
      return petData;
    }
    
    // Create a new allergies array with the added allergy
    const allergies = [...existingAllergies, allergy];
    
    try {
      // Update the pet with the new medical record including the added allergy
      const updatedPet = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        allergies,
      });
      
      console.log("Updated pet after adding allergy:", updatedPet);
      return updatedPet;
    } catch (error) {
      // If there was an error, try refreshing the data
      console.error("Error adding allergy:", error);
      
      // Wait a moment to ensure any database operations have time to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch fresh data
      const refreshedPet = await this.getPet(petId);
      
      // If the allergy is now in the list, consider it successful
      const refreshedAllergies = refreshedPet.medicalRecord?.allergies || [];
      const justAdded = refreshedAllergies.find((a: { allergie: string; }) => 
        a.allergie === allergy.allergie
      );
      
      if (justAdded) {
        console.log("Allergy was added despite error, returning refreshed data");
        return refreshedPet;
      }
      
      // If not found after refresh, rethrow the original error
      throw error;
    }
  }
  
  /**
   * Update an existing allergy in a pet's medical record
   */
  static async updateAllergy(petId: string, allergyId: string, updatedAllergy: Allergy) {
    console.log("Updating allergy:", { petId, allergyId, updatedAllergy });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const allergies = [...(medicalRecord.allergies || [])];
    
    // Find the index of the allergy with the given ID
    const allergyIndex = allergies.findIndex(a => String(a.id) === allergyId);
    
    if (allergyIndex === -1) {
      throw new Error(`Allergy with ID ${allergyId} not found`);
    }
    
    // Log the original allergy for comparison
    console.log("Original allergy:", allergies[allergyIndex]);
    
    // When updating, preserve the original ID from the database
    const completeUpdatedAllergy = {
      ...allergies[allergyIndex], // Start with all existing properties
      ...updatedAllergy, // Override with provided updates
      id: allergies[allergyIndex].id // Preserve original database ID
    };
    
    console.log("Complete updated allergy:", completeUpdatedAllergy);
    
    // Replace the allergy at the specified index
    allergies[allergyIndex] = completeUpdatedAllergy;
    
    // Update the pet with the modified medical record
    const result = await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      allergies,
    });
    
    // Return the updated pet data directly
    return result;
  }
  
  /**
   * Delete an allergy from a pet's medical record
   */
  static async deleteAllergy(petId: string, allergyId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const allergies = [...(medicalRecord.allergies || [])];
    
    // Filter out the allergy with the given ID
    const updatedAllergies = allergies.filter(allergy => String(allergy.id) !== allergyId);
    
    // Verify that an allergy was actually removed
    if (updatedAllergies.length === allergies.length) {
      throw new Error(`Allergy with ID ${allergyId} not found`);
    }
    
    // Update the pet with the modified medical record
    const result = await this.updateMedicalRecord(petId, {
      ...medicalRecord,
      allergies: updatedAllergies,
    });
    
    // Return the updated pet data directly
    return result;
  }
  
  static async addLabTest(petId: string, labTest: LaboratoryTest) {
    console.log("Adding laboratory test:", labTest);
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    
    // Make sure required fields are included
    if (!labTest.type) {
      throw new Error('Test type is required');
    }
    
    // When creating a new lab test, explicitly set its ID to empty string
    // This signals to the backend that it should assign a new ID
    labTest.id = '';
    
    // Create a new laboratory tests array with the added test
    const laboratoryTests = [...(medicalRecord.laboratoryTests || []), labTest];
    
    try {
      // Update the pet with the new medical record including the added test
      const updatedPet = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        laboratoryTests,
      });
      
      console.log("Updated pet after adding lab test:", updatedPet);
      return updatedPet;
    } catch (error) {
      // If there was an error, try refreshing the data
      console.error("Error adding lab test:", error);
      
      // Wait a moment to ensure any database operations have time to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch fresh data
      const refreshedPet = await this.getPet(petId);
      console.log("Refreshed pet data after error:", refreshedPet);
      
      // If the lab test is now in the list, consider it successful
      const refreshedLabTests = refreshedPet.medicalRecord?.laboratoryTests || [];
      const justAdded = refreshedLabTests.find((test: { type: string; date: string | undefined; }) => 
        test.type === labTest.type && 
        test.date === labTest.date
      );
      
      if (justAdded) {
        console.log("Lab test was added despite error, returning refreshed data");
        return refreshedPet;
      }
      
      // If not found after refresh, rethrow the original error
      throw error;
    }
  }
  
  /**
   * Update an existing laboratory test in a pet's medical record
   */
  static async updateLabTest(petId: string, labTestId: string, updatedLabTest: LaboratoryTest) {
    console.log("Updating laboratory test:", { petId, labTestId, updatedLabTest });
    
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const laboratoryTests = [...(medicalRecord.laboratoryTests || [])];
    
    // Find the index of the lab test with the given ID
    const labTestIndex = laboratoryTests.findIndex(test => String(test.id) === String(labTestId));
    
    if (labTestIndex === -1) {
      throw new Error(`Laboratory test with ID ${labTestId} not found`);
    }
    
    // Make sure required fields are included
    if (!updatedLabTest.type) {
      throw new Error('Test type is required');
    }
    
    // Log the original lab test for comparison
    console.log("Original laboratory test:", laboratoryTests[labTestIndex]);
    
    // When updating, preserve the original ID and any existing fields not included in the update
    const completeUpdatedLabTest = {
      ...laboratoryTests[labTestIndex], // Start with all existing properties
      ...updatedLabTest, // Override with provided updates
      id: laboratoryTests[labTestIndex].id // Preserve original database ID
    };
    
    console.log("Complete updated laboratory test:", completeUpdatedLabTest);
    
    // Replace the lab test at the specified index
    laboratoryTests[labTestIndex] = completeUpdatedLabTest;
    
    try {
      // Update the pet with the modified medical record
      const result = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        laboratoryTests,
      });
      
      // Return the updated pet data directly
      return result;
    } catch (error) {
      console.error("Error updating lab test:", error);
      
      // Wait a moment and try to refresh the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const refreshedPet = await this.getPet(petId);
      
      return refreshedPet;
    }
  }
  
  /**
   * Delete a laboratory test from a pet's medical record
   */
  static async deleteLabTest(petId: string, labTestId: string) {
    // First fetch the current pet data
    const petData = await this.getPet(petId);
    
    // Extract the medical record
    const medicalRecord = petData.medicalRecord || {};
    const laboratoryTests = [...(medicalRecord.laboratoryTests || [])];
    
    // Filter out the lab test with the given ID
    const updatedLabTests = laboratoryTests.filter(test => String(test.id) !== String(labTestId));
    
    // Verify that a lab test was actually removed
    if (updatedLabTests.length === laboratoryTests.length) {
      throw new Error(`Laboratory test with ID ${labTestId} not found`);
    }
    
    try {
      // Update the pet with the modified medical record
      const result = await this.updateMedicalRecord(petId, {
        ...medicalRecord,
        laboratoryTests: updatedLabTests,
      });
      
      // Return the updated pet data directly
      return result;
    } catch (error) {
      console.error("Error deleting lab test:", error);
      
      // Wait a moment and try to refresh the data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const refreshedPet = await this.getPet(petId);
      
      // Check if the lab test was actually deleted
      const stillExists = refreshedPet.medicalRecord?.laboratoryTests?.some(
        (test: { id: unknown; }) => String(test.id) === String(labTestId)
      );
      
      if (!stillExists) {
        console.log("Lab test was deleted despite error, returning refreshed data");
        return refreshedPet;
      }
      
      throw error;
    }
  }
  
 // Updated method for Payload CMS
static updatePetDailyCare = async (petId: string, dailyCareData: DailyCareData) => {
  try {
    // In Payload, you typically update the entire document
    // So we need to structure our update correctly
    const updateData = {
      dailyCare: dailyCareData
    };
    
    // Use the Payload API endpoint pattern
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PATCH', // Payload typically uses PATCH for updates
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Failed response:', await response.text());
      throw new Error(`Failed to update daily care: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating daily care:', error);
    throw error;
  }
};

/**
 * Add a new reminder to a pet
 */
static async addReminder(petId: string, reminder: Reminder) {
  console.log("Adding reminder:", reminder);
  
  // First fetch the current pet data
  const petData = await this.getPet(petId);
  
  // Make sure the date field is included
  if (!reminder.date) {
    throw new Error('Reminder date is required');
  }
  
  // Make sure the type field is included
  if (!reminder.type) {
    throw new Error('Reminder type is required');
  }
  
  // When creating a new reminder, explicitly set its ID to empty string
  // This signals to the backend that it should assign a new ID
  reminder.id = '';
  
  // Create a new reminders array with the added reminder
  const reminders = [...(petData.reminders || []), reminder];
  
  try {
    // Update the pet with the new reminders list
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reminders,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (_e) {
        errorText = await response.text();
      }
      throw new Error(`Failed to add reminder: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const updatedPet = await response.json();
    console.log("Updated pet after adding reminder:", updatedPet);
    return updatedPet;
  } catch (error) {
    // If there was an error, it might be due to a duplicate request or ID conflict
    // Try refreshing the data to see if the reminder was actually added
    console.error("Error adding reminder:", error);
    
    // Wait a moment to ensure any database operations have time to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch fresh data
    const refreshedPet = await this.getPet(petId);
    console.log("Refreshed pet data after error:", refreshedPet);
    
    // If the reminder is now in the list, consider it successful
    const refreshedReminders = refreshedPet.reminders || [];
    const justAdded = refreshedReminders.find((r: { date: string; type: string; }) => 
      r.date === reminder.date && 
      r.type === reminder.type
    );
    
    if (justAdded) {
      console.log("Reminder was added despite error, returning refreshed data");
      return refreshedPet;
    }
    
    // If not found after refresh, rethrow the original error
    throw error;
  }
}

/**
 * Update an existing reminder
 */
static async updateReminder(petId: string, reminderId: string, updatedReminder: Reminder) {
  console.log("Updating reminder:", { petId, reminderId, updatedReminder });
  
  // First fetch the current pet data
  const petData = await this.getPet(petId);
  
  // Extract the reminders
  const reminders = [...(petData.reminders || [])];
  
  // Find the index of the reminder with the given ID
  const reminderIndex = reminders.findIndex(r => String(r.id) === String(reminderId));
  
  if (reminderIndex === -1) {
    throw new Error(`Reminder with ID ${reminderId} not found`);
  }
  
  // Validate required fields
  if (!updatedReminder.date) {
    throw new Error('Reminder date is required');
  }
  
  if (!updatedReminder.type) {
    throw new Error('Reminder type is required');
  }
  
  // Log the original reminder for comparison
  console.log("Original reminder:", reminders[reminderIndex]);
  
  // Make sure we preserve the ID and merge with existing data
  const completeUpdatedReminder = {
    ...reminders[reminderIndex], // Start with all existing properties
    ...updatedReminder, // Override with provided updates
    id: reminders[reminderIndex].id // Preserve original database ID
  };
  
  console.log("Complete updated reminder:", completeUpdatedReminder);
  
  // Replace the reminder at the specified index
  reminders[reminderIndex] = completeUpdatedReminder;
  
  try {
    // Update the pet with the modified reminders
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reminders,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (_e) {
        errorText = await response.text();
      }
      throw new Error(`Failed to update reminder: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const updatedPet = await response.json();
    console.log("Updated pet after updating reminder:", updatedPet);
    return updatedPet;
  } catch (error) {
    // If there was an error, try refreshing the data
    console.error("Error updating reminder:", error);
    
    // Wait a moment to ensure any database operations have time to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch fresh data
    const refreshedPet = await this.getPet(petId);
    console.log("Refreshed pet data after error:", refreshedPet);
    
    // Return the refreshed data regardless of success/failure
    return refreshedPet;
  }
}

/**
 * Delete a reminder
 */
static async deleteReminder(petId: string, reminderId: string) {
  console.log("Deleting reminder:", { petId, reminderId });
  
  // First fetch the current pet data
  const petData = await this.getPet(petId);
  
  // Extract the reminders
  const reminders = [...(petData.reminders || [])];
  
  // Filter out the reminder with the given ID
  const updatedReminders = reminders.filter(reminder => String(reminder.id) !== String(reminderId));
  
  // Verify that a reminder was actually removed
  if (updatedReminders.length === reminders.length) {
    throw new Error(`Reminder with ID ${reminderId} not found`);
  }
  
  try {
    // Update the pet with the modified reminders
    const response = await fetch(`/api/pets/${petId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reminders: updatedReminders,
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (_e) {
        errorText = await response.text();
      }
      throw new Error(`Failed to delete reminder: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const updatedPet = await response.json();
    console.log("Updated pet after deleting reminder:", updatedPet);
    return updatedPet;
  } catch (error) {
    // If there was an error, try refreshing the data
    console.error("Error deleting reminder:", error);
    
    // Wait a moment to ensure any database operations have time to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch fresh data
    const refreshedPet = await this.getPet(petId);
    console.log("Refreshed pet data after error:", refreshedPet);
    
    // Check if the reminder was actually deleted
    const stillExists = refreshedPet.reminders?.some(
      (reminder: { id: unknown; }) => String(reminder.id) === String(reminderId)
    );
    
    if (!stillExists) {
      console.log("Reminder was deleted despite error, returning refreshed data");
      return refreshedPet;
    }
    
    throw error;
  }
}

  private static cleanupIds(medicalRecord: MedicalRecord): MedicalRecord {
    // Create a deep copy to avoid modifying the original
    const cleaned: MedicalRecord = JSON.parse(JSON.stringify(medicalRecord));
    
    // Handle laboratoryTests IDs
    if (cleaned.laboratoryTests) {
      cleaned.laboratoryTests = cleaned.laboratoryTests.map(item => {
        // For new temporary entries or empty IDs, ensure they're empty strings
        if (typeof item.id === 'string' && (
          item.id.startsWith('temp-') || 
          item.id === '' || 
          item.id.startsWith('optimistic-') ||
          item.id.startsWith('labtest-')
        )) {
          return { ...item, id: '' };
        }
        
        // For IDs that are plain numbers (stored as strings), they may conflict
        // with auto-increment IDs in the database
        if (typeof item.id === 'string' && !isNaN(Number(item.id)) && !item.id.includes('-')) {
          console.log(`Converting numeric ID ${item.id} to empty string to prevent conflicts`);
          return { ...item, id: '' };
        }
        
        // Handle resultsDocs field
        if (item.resultsDocs) {
          // If resultsDocs is a string or an object with an id property
          const resultsDocs = typeof item.resultsDocs === 'string' 
            ? item.resultsDocs 
            : (item.resultsDocs as { id?: string }).id;
          
          // If it's a valid ID, keep it; otherwise, set to undefined
          if (resultsDocs) {
            item.resultsDocs = resultsDocs;
          } else {
            delete item.resultsDocs;
          }
        }
        
        return item;
      });
    }
    
    
    // Handle allergies IDs
    if (cleaned.allergies) {
      cleaned.allergies = cleaned.allergies.map(item => {
        // For new temporary entries, remove the ID so backend can assign one
        if (typeof item.id === 'string' && (
          item.id.startsWith('temp-') || 
          item.id === '' || 
          item.id.startsWith('optimistic-')
        )) {
          return { ...item, id: '' };
        }
        
        // For IDs that are plain numbers (stored as strings), they may conflict
        // with auto-increment IDs in the database
        if (typeof item.id === 'string' && !isNaN(Number(item.id)) && !item.id.includes('-')) {
          console.log(`Converting numeric ID ${item.id} to empty string to prevent conflicts`);
          return { ...item, id: '' };
        }
        
        return item;
      });
    }
    
    // *** IMPORTANT: Handle vet appointments IDs ***
    if (cleaned.vetAppointments) {
      cleaned.vetAppointments = cleaned.vetAppointments.map(item => {
        // For new temporary entries, remove the ID so backend can assign one
        if (typeof item.id === 'string' && item.id.startsWith('temp-')) {
          return { ...item, id: '' };
        }
        
        // For IDs that are plain numbers (stored as strings), they may conflict
        // with auto-increment IDs in the database
        if (typeof item.id === 'string' && !isNaN(Number(item.id)) && !item.id.includes('-')) {
          console.log(`Converting numeric ID ${item.id} to empty string to prevent conflicts`);
          return { ...item, id: '' };
        }
        
        return item;
      });
    }
    
    // Clean up deworming IDs if they are numeric but stored as strings
    if (cleaned.deworming) {
      cleaned.deworming = cleaned.deworming.map(item => {
        // If the ID is numeric and stored as a string (e.g., "21"), convert it to ensure consistent comparison
        if (typeof item.id === 'string' && !isNaN(Number(item.id)) && !item.id.includes('-')) {
          return { ...item, id: `dw-${item.id}` }; // Prefix with "dw-" to make it non-numeric
        }
        return item;
      });
    }
    
    return cleaned;
  }
    
   
}

export default PetService;