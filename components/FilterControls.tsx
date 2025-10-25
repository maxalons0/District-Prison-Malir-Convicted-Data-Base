import React from 'react';
import type { Filters, Page } from '../types';
import { Status, Category } from '../types';

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onGenerateReport: () => void;
  onOpenDateModal: () => void;
  isGeneratingReport: boolean;
  isBusy: boolean;
  uniqueNationalities: string[];
  uniqueCrimeTypes: string[];
  uniqueUnderSections: string[];
  page: Page;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onGenerateReport,
  onOpenDateModal,
  isGeneratingReport,
  isBusy,
  uniqueNationalities,
  uniqueCrimeTypes,
  uniqueUnderSections,
  page,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };
  
  // Hide status filter on pages where the status is implied
  const showStatusFilter = !['Released', 'Detainees'].includes(page);
  const inputClassName = "w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6 container mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
        {/* Search fields */}
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-300 mb-1">Search Name/Convict#</label>
          <input type="text" id="searchTerm" name="searchTerm" value={filters.searchTerm} onChange={handleInputChange} placeholder="Enter name or convict no..." className={inputClassName} disabled={isBusy} />
        </div>
        
        {/* Dropdowns */}
        {page === 'Home' && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select id="category" name="category" value={filters.category} onChange={handleInputChange} className={inputClassName} disabled={isBusy}>
              <option value="All">All</option>
              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        )}
        {showStatusFilter && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleInputChange} className={inputClassName} disabled={isBusy}>
              <option value="All">All</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-300 mb-1">Nationality</label>
          <select id="nationality" name="nationality" value={filters.nationality} onChange={handleInputChange} className={inputClassName} disabled={isBusy}>
            <option value="">All</option>
            {uniqueNationalities.map(nat => <option key={nat} value={nat}>{nat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="crimeType" className="block text-sm font-medium text-gray-300 mb-1">Crime Type</label>
          <select id="crimeType" name="crimeType" value={filters.crimeType} onChange={handleInputChange} className={inputClassName} disabled={isBusy}>
            <option value="">All</option>
            {uniqueCrimeTypes.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="underSection" className="block text-sm font-medium text-gray-300 mb-1">Under Section</label>
          <select id="underSection" name="underSection" value={filters.underSection} onChange={handleInputChange} className={inputClassName} disabled={isBusy}>
            <option value="">All</option>
            {uniqueUnderSections.map(us => <option key={us} value={us}>{us}</option>)}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 lg:col-span-2">
            <button
              onClick={onGenerateReport}
              disabled={isBusy}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ...
                </>
              ) : (
                 "AI Report"
              )}
            </button>
            <button
              onClick={onOpenDateModal}
              disabled={isBusy}
              className="w-full bg-blue-500 hover:bg-blue-600 border border-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center disabled:bg-blue-800 disabled:cursor-not-allowed disabled:border-blue-700"
            >
              Detailed Report
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;