import React from 'react';
import type { Page } from '../types';

interface HeaderProps {
  onAddPrisoner: () => void;
  onImportClick: () => void;
  onAiImportClick: () => void;
  onExport: () => void;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  pageTitle: string;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'Home', label: 'Home' },
  { id: 'General', label: 'General' },
  { id: 'Civil', label: 'Civil' },
  { id: 'Foreigner', label: 'Foreigners' },
  { id: 'Detainees', label: 'Detainees' },
  { id: 'FineRelated', label: 'Fine/Diyat' },
  { id: 'Released', label: 'Released' },
];


const Header: React.FC<HeaderProps> = ({ onAddPrisoner, onImportClick, onAiImportClick, onExport, currentPage, onPageChange, pageTitle }) => {
  return (
    <header className="bg-gray-800 shadow-md p-2 mb-6 sticky top-0 z-10">
      <div className="container mx-auto">
        {/* Top row: Title and main actions */}
        <div className="flex justify-between items-center mb-2 px-2">
            <h1 className="text-xl font-bold text-gray-200 tracking-wider">
                {pageTitle}
            </h1>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onAddPrisoner}
                    className="bg-blue-500 hover:bg-blue-600 border border-blue-600 text-white font-bold py-2 px-3 rounded text-sm transition duration-300 ease-in-out flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Prisoner
                </button>
                 <button
                    onClick={onAiImportClick}
                    className="bg-purple-500 hover:bg-purple-600 border border-purple-600 text-white font-bold py-2 px-3 rounded text-sm transition duration-300 ease-in-out flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7l2.288 1.256a1 1 0 010 1.788L14.146 11l-1.179 4.256A1 1 0 0112 16.236V2z" clipRule="evenodd" />
                    </svg>
                    AI Import
                </button>
                 <button
                    onClick={onImportClick}
                    className="bg-green-500 hover:bg-green-600 border border-green-600 text-white font-bold py-2 px-3 rounded text-sm transition duration-300 ease-in-out flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Import
                </button>
                 <button
                    onClick={onExport}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded text-sm transition duration-300 ease-in-out flex items-center"
                >
                    Export
                </button>
            </div>
        </div>
        {/* Bottom row: Navigation tabs */}
        <nav className="flex items-center border-t border-gray-700 pt-2 flex-wrap">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`px-3 py-1 text-sm font-medium rounded-t border-b-2 transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;