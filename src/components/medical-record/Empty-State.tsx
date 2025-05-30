// components/medical-record/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  category: string;
  isOwner: boolean;
  onAddClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ category, isOwner, onAddClick }) => {
  return (
    <div className="py-8 text-center">
      <p className="text-gray-500">No {category} records available.</p>
      {isOwner && (
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 mt-4 text-xl font-medium text-white bg-[#3479ba] border border-transparent rounded-md shadow-sm hover:bg-[#3479ba]"
        >
          Add {category} Record
        </button>
      )}
    </div>
  );
};

export default EmptyState;