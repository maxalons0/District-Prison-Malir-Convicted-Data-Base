import React, { useState } from 'react';

interface DateRangeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (startDate: string, endDate: string, sections: string[]) => void;
}

const mainSections = {
    admissions: 'Admissions',
    releases: 'Releases',
    sentenceCompletion: 'Sentence Analysis',
    fineRelated: 'Fine/Diyat Cases',
};

const analyticalSections = {
    breakdownByCategory: 'By Category',
    breakdownByCrimeType: 'By Crime Type',
    breakdownByDistrict: 'By District',
    breakdownByNationality: 'By Nationality',
    breakdownByPS: 'By Police Station',
    breakdownByCourt: 'By Sentencing Court',
    breakdownBySection: 'By Under Section',
};

const initialSectionsState = {
    admissions: true,
    releases: true,
    sentenceCompletion: true,
    fineRelated: true,
    breakdownByCategory: false,
    breakdownByCrimeType: false,
    breakdownByDistrict: false,
    breakdownByNationality: false,
    breakdownByPS: false,
    breakdownByCourt: false,
    breakdownBySection: false,
};


const DateRangeReportModal: React.FC<DateRangeReportModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [sections, setSections] = useState(initialSectionsState);

  if (!isOpen) return null;
  
  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setSections(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      setError('Please select both a start and end date.');
      return;
    }
    if (startDate > endDate) {
      setError('Start date cannot be after the end date.');
      return;
    }
    const selectedSections = Object.entries(sections)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => key);

    if (selectedSections.length === 0) {
        setError('Please select at least one report section to include.');
        return;
    }

    setError('');
    onGenerate(startDate, endDate, selectedSections);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded shadow-xl w-full max-w-2xl flex flex-col border border-gray-700">
        <div className="bg-gray-900 p-4 border-b border-gray-700 rounded-t">
            <h2 className="text-xl font-bold text-gray-200">Generate Detailed Report</h2>
        </div>
        <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 border-b border-gray-600 pb-1">Main Sections:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                        {Object.entries(mainSections).map(([key, label]) => (
                            <label key={key} className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={key}
                                    checked={sections[key as keyof typeof sections]}
                                    onChange={handleSectionChange}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2 border-b border-gray-600 pb-1">Analytical Breakdowns (for Admissions):</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                        {Object.entries(analyticalSections).map(([key, label]) => (
                            <label key={key} className="flex items-center space-x-2 text-sm text-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={key}
                                    checked={sections[key as keyof typeof sections]}
                                    onChange={handleSectionChange}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                 </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
            </div>
        </div>
        <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-4 rounded transition">Cancel</button>
          <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white font-bold py-2 px-4 rounded transition">Generate Report</button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeReportModal;