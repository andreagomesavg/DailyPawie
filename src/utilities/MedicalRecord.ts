// types/MedicalRecord.ts
export interface Vaccine {
    id: string;
    vaccineType: string;
    administrationDate?: string;
    nextDosis?: string;
    lotNumber?: string;
  }
  
  export interface Deworming {
    id: string;    
    type: string;
    antiparasitic?: string;
    administrationDate?: string;
    frequency?: string;
  }
  
  export interface VetAppointment {
    id: string;
    date: string;
    reason?: string;
    diagnostic?: string;
    treatment?: string;
  }
  
  export interface SurgicalProcedure {
    id: string;
    type: string;
    date: string;
    complications?: string;
    medicationPostoperative?: string;
  }
  
  export interface Allergy {
    id: string;
    allergie: string;
    description?: string;
  }
  
  export interface LaboratoryTest {
    id: string;
    // Matches Payload CMS select field options
    type: 'blood' | 'urine' | 'x-ray' | 'ultrasound' | 'another';
    date?: string;
    results?: string;
    // For Payload CMS, this would be a string ID reference to the documents collection
    resultsDocs?: string | { id: string };
  }
  export interface MedicalTreatment {
    id: string;
    medicine: string;
    dose?: string;
    duration?: string;
    aditionalTerapy?: string;
  }
  
  export interface Evolution {
    id: string;
    date: string;
    notes?: string;
    treatmentChanges?: string;
  }
  
  export interface MedicalRecord {
    vaccines?: Vaccine[];
    deworming?: Deworming[];
    vetAppointments?: VetAppointment[];
    surgicalProcedures?: SurgicalProcedure[];
    allergies?: Allergy[];
    laboratoryTests?: LaboratoryTest[];
    medicalTreatments?: MedicalTreatment[];
    evolutionTracking?: Evolution[];
  }

  export interface Reminder {
    id?: string;
    type: string;
    date: string;
    time?: string;
    description?: string;
  }