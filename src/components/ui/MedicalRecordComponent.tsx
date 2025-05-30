"use client"
import { MedicalRecord } from '@/utilities/MedicalRecord';
import React, { useState } from 'react';
import VaccinesComponent from '../medical-record/VaccinesComponent';
import DewormingComponent from '../medical-record/DewormingComponent';
import VetAppointmentsComponent from '../medical-record/VetAppointmentsComponent';
import SurgicalProceduresComponent from '../medical-record/SurgicalProceduresComponent';
import AllergiesComponent from '../medical-record/AllergiesComponent';
import LabTestsComponent from '../medical-record/LabTestsComponent';
import { toast } from '@payloadcms/ui';

// Define proper interfaces for medical record items
interface Vaccine {
  id?: string;
  vaccineType: string;
  administrationDate?: string;
  nextDosis?: string;
  lotNumber?: string;
  veterinarian?: string;
  notes?: string;
}

interface DewormingRecord {
  id?: string;
  type?: string;
  antiparasitic?: string;
  administrationDate?: string;
  frequency?: string;
}

interface VetAppointment {
  id?: string;
  date?: string;
  reason?: string;
  diagnostic?: string;
  treatment?: string;
}

interface SurgicalProcedure {
  id?: string;
  type?: string;
  date?: string;
  complications?: string;
  medicationPostoperative?: string;
}

interface Allergy {
  id?: string;
  allergie?: string;
  description?: string;
}

interface LaboratoryTest {
  id?: string;
  type?: string;
  date?: string;
  results?: string;
  resultsDocs?: string | { id: string };
}

interface MedicalTreatment {
  id?: string;
  medicine?: string;
  dose?: string;
  duration?: string;
  aditionalTerapy?: string;
}

interface EvolutionTracking {
  id?: string;
  date?: string;
  notes?: string;
  treatmentChanges?: string;
}

interface MedicalRecordContainerProps {
  medicalRecord?: MedicalRecord;
  petId: string;
  isOwner: boolean;
  onUpdateRecord?: (updatedRecord: MedicalRecord) => void;
}

type MedicalCategory = 'vaccines' | 'deworming' | 'appointments' | 'surgeries' | 'allergies' | 'labs' | 'treatments' | 'evolution';

const MedicalRecordContainer: React.FC<MedicalRecordContainerProps> = ({ 
  medicalRecord = {}, 
  petId, 
  isOwner,
  onUpdateRecord 
}) => {
  const [activeCategory, setActiveCategory] = useState<MedicalCategory>('vaccines');
  const [localUpdating, setLocalUpdating] = useState(false);

  const handleUpdateVaccines = async (updatedVaccines: Vaccine[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      console.log("Vaccines received for update:", updatedVaccines);
      
      // Create a copy of the current medical record
      const updatedRecord = { 
        ...medicalRecord,
        // Ensure vaccines array is properly formatted with all required fields
        vaccines: updatedVaccines.map(vaccine => ({
          id: vaccine.id || `vaccine-${Math.random().toString(36).substr(2, 9)}`,
          vaccineType: vaccine.vaccineType,
          administrationDate: vaccine.administrationDate || undefined,
          nextDosis: vaccine.nextDosis || undefined,
          lotNumber: vaccine.lotNumber || undefined,
          // Add any other required fields from the original vaccine
          ...(vaccine.veterinarian ? { veterinarian: vaccine.veterinarian } : {}),
          ...(vaccine.notes ? { notes: vaccine.notes } : {})
        }))
      };
      
      console.log("Sending updated record to parent:", updatedRecord);
      
      // Call the parent component's update function
      await onUpdateRecord(updatedRecord);
      
      // Show success notification
      toast.success('Vaccines updated successfully');
    } catch (error) {
      console.error('Failed to update vaccines:', error);
      toast.error('Failed to update vaccines');
    } finally {
      setLocalUpdating(false);
    }
  };

  // Other update handlers with proper typing
  const handleUpdateDeworming = async (deworming: DewormingRecord[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.deworming = deworming;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating deworming:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleUpdateVetAppointments = async (vetAppointments: VetAppointment[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.vetAppointments = vetAppointments;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating vet appointments:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleUpdateSurgicalProcedures = async (surgicalProcedures: SurgicalProcedure[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.surgicalProcedures = surgicalProcedures;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating surgical procedures:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleUpdateAllergies = async (allergies: Allergy[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.allergies = allergies;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating allergies:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const handleUpdateLabTests = async (laboratoryTests: LaboratoryTest[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.laboratoryTests = laboratoryTests;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating lab tests:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  // Prefix with underscore to indicate these are kept for future implementation
  const _handleUpdateTreatments = async (medicalTreatments: MedicalTreatment[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.medicalTreatments = medicalTreatments;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating treatments:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  const _handleUpdateEvolution = async (evolutionTracking: EvolutionTracking[]) => {
    if (!onUpdateRecord) return;
    
    setLocalUpdating(true);
    try {
      const updatedRecord = JSON.parse(JSON.stringify(medicalRecord));
      updatedRecord.evolutionTracking = evolutionTracking;
      await onUpdateRecord(updatedRecord);
    } catch (error) {
      console.error('Error updating evolution tracking:', error);
    } finally {
      setLocalUpdating(false);
    }
  };

  // Render content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'vaccines':
        return (
          <VaccinesComponent 
            vaccines={medicalRecord.vaccines || []}
            isOwner={isOwner}
            onUpdate={handleUpdateVaccines}
            petId={petId} // Pass petId here
          />
        );
      case 'deworming':
        return (
          <DewormingComponent 
            deworming={medicalRecord.deworming || []}
            isOwner={isOwner}
            onUpdate={handleUpdateDeworming}
            petId={petId}
          />
        );
      case 'appointments':
        return (
          <VetAppointmentsComponent 
            appointments={medicalRecord.vetAppointments || []}
            isOwner={isOwner}
            onUpdate={handleUpdateVetAppointments}
            petId={petId}
          />
        );
      case 'surgeries':
        return (
          <SurgicalProceduresComponent 
            procedures={medicalRecord.surgicalProcedures || []}
            isOwner={isOwner}
            onUpdate={handleUpdateSurgicalProcedures}
            petId={petId}
          />
        );
      case 'allergies':
        return (
          <AllergiesComponent 
            allergies={medicalRecord.allergies || []}
            isOwner={isOwner}
            onUpdate={handleUpdateAllergies}
            petId={petId}
          />
        );
      case 'labs':
        return (
          <LabTestsComponent 
  laboratoryTests={medicalRecord.laboratoryTests || []}
  isOwner={isOwner}
  onUpdate={handleUpdateLabTests}
  petId={petId}
/>
        );
      case 'treatments':
        // We'll need to implement this component
        return (
          <div className="p-4 bg-white rounded-lg">
            <p className="text-center text-gray-500">Medical treatments feature coming soon</p>
          </div>
        );
      case 'evolution':
        // We'll need to implement this component
        return (
          <div className="p-4 bg-white rounded-lg">
            <p className="text-center text-gray-500">Evolution tracking feature coming soon</p>
          </div>
        );
      default:
        return (
          <VaccinesComponent 
            vaccines={medicalRecord.vaccines || []}
            isOwner={isOwner}
            onUpdate={handleUpdateVaccines}
            petId={petId} // Pass petId here too
          />
        );
    }
  };

  if (!medicalRecord) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Medical Record</h3>
          <p className="text-gray-500">No medical records available for this pet.</p>
          {isOwner && (
            <button
              onClick={() => setActiveCategory('vaccines')}
              className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
            >
              Add Medical Record
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-[#001e4c] pt-2  font-bold leading-none text-left 
          text-[36px] sm:text-[clamp(2.5rem,3vw+0.5rem,4.5rem)] tracking-tight pb-2">Medical Record</h3>
      
      {/* Category Tabs */}
      <div className="pt-2 mb-6 ">
      <nav className="flex -mb-px space-x-4 overflow-x-auto">
  <button
    onClick={() => setActiveCategory('vaccines')}
    className={`
       lg:text-2xl text-xl
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none
      whitespace-nowrap  hover:cursor-pointer
      ${activeCategory === 'vaccines'
        ? 'text-[#3479ba]'
        : 'hover:text-gray-600'
      }
    `}
  >
    Vaccines
    {activeCategory === 'vaccines' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('deworming')}
    className={`
      lg:text-2xl text-xl 
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none  hover:cursor-pointer
      ${activeCategory === 'deworming'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Deworming
    {activeCategory === 'deworming' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('appointments')}
    className={`
      lg:text-2xl text-xl
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none
      whitespace-nowrap  hover:cursor-pointer
      ${activeCategory === 'appointments'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Appointments
    {activeCategory === 'appointments' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('surgeries')}
    className={`
      lg:text-2xl text-xl
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none  hover:cursor-pointer
      ${activeCategory === 'surgeries'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Surgeries
    {activeCategory === 'surgeries' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('allergies')}
    className={`
      lg:text-2xl text-xl
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none  hover:cursor-pointer
      ${activeCategory === 'allergies'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Allergies
    {activeCategory === 'allergies' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
  
  <button
    onClick={() => setActiveCategory('labs')}
    className={`
      lg:text-2xl text-xl
      bg-white 
      relative 
      pb-2
      focus:outline-none
      focus:ring-0
      focus:border-0
      active:outline-none
      active:border-0
      border-0
      shadow-none
      whitespace-nowrap  hover:cursor-pointer
      ${activeCategory === 'labs'
        ? 'text-[#3479ba]'
        : 'text-gray-500 hover:text-gray-700'
      }
    `}
  >
    Lab Tests
    {activeCategory === 'labs' && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3479ba]"></span>
    )}
  </button>
</nav>
      </div>

      {localUpdating && (
        <div className="px-4 py-2 mb-4 text-xl text-blue-700 bg-blue-100 rounded">
          Updating medical record...
        </div>
      )}

      {/* Content Area */}
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default MedicalRecordContainer;