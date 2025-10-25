import React from 'react';

interface StatusBarProps {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ totalRecords, currentPage, totalPages }) => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 px-4 py-1 text-xs text-gray-400">
      <div className="container mx-auto flex justify-between items-center">
        <span>Total Records: {totalRecords}</span>
        {totalPages > 0 && (
          <span>Page {currentPage + 1} of {totalPages}</span>
        )}
        <span>Ready</span>
      </div>
    </footer>
  );
};

export default StatusBar;
