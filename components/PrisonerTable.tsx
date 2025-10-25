import React from 'react';
import type { Prisoner, SortConfig } from '../types';
import { getStatusColor } from '../utils/styleUtils';

interface PrisonerTableProps {
  prisoners: Prisoner[];
  onViewDetails: (prisoner: Prisoner) => void;
  onEdit: (prisoner: Prisoner) => void;
  onSort: (key: keyof Prisoner) => void;
  sortConfig: SortConfig;
}

const tableHeaders: { label: string, key: keyof Prisoner | null, sortable: boolean }[] = [
    { label: "S.No", key: "sNo", sortable: true },
    { label: "Convict #", key: "convictNo", sortable: true },
    { label: "Name", key: "name", sortable: true },
    { label: "Father Name", key: "fatherName", sortable: false },
    { label: "Category", key: "category", sortable: false },
    { label: "Crime Type", key: "crimeType", sortable: false },
    { label: "Status", key: "status", sortable: false },
    { label: "Admission Date", key: "admissionDate", sortable: true },
    { label: "Actions", key: null, sortable: false },
];

const PrisonerTable: React.FC<PrisonerTableProps> = ({ prisoners, onViewDetails, onEdit, onSort, sortConfig }) => {

  return (
    <div className="container mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              {tableHeaders.map((header) => (
                <th 
                  key={header.label} 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider whitespace-nowrap ${header.sortable ? 'cursor-pointer hover:bg-gray-700' : ''}`}
                  onClick={() => header.sortable && header.key && onSort(header.key)}
                >
                  <div className="flex items-center">
                    {header.label}
                    {sortConfig && sortConfig.key === header.key && (
                      <span className="ml-2">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {prisoners.length > 0 ? (
              prisoners.map((prisoner) => (
                <tr key={prisoner.id} className="hover:bg-gray-700 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.sNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.convictNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{prisoner.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.fatherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.crimeType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prisoner.status)}`}>
                        {prisoner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{prisoner.admissionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => onViewDetails(prisoner)} className="text-blue-400 hover:text-blue-300 transition" title="View Details">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                           </svg>
                        </button>
                        <button onClick={() => onEdit(prisoner)} className="text-gray-400 hover:text-gray-300 transition" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center py-10 text-gray-500">
                  No prisoners match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrisonerTable;