import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  const handlePrevious = () => {
    onPageChange(Math.max(0, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1));
  };

  return (
    <div className="container mx-auto mt-4 flex justify-end items-center space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="px-4 py-2 bg-gray-800 border border-gray-600 text-sm font-medium rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
        className="px-4 py-2 bg-gray-800 border border-gray-600 text-sm font-medium rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
