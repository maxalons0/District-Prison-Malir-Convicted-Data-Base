import React from 'react';
import type { Prisoner } from '../types';
import { getStatusColor } from '../utils/styleUtils';

interface PrisonerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prisoner: Prisoner | null;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-sm text-gray-100 whitespace-pre-wrap">{value || 'N/A'}</dd>
  </div>
);

const PrisonerDetailsModal: React.FC<PrisonerDetailsModalProps> = ({ isOpen, onClose, prisoner }) => {
  if (!isOpen || !prisoner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-700">
        <div className="bg-gray-900 p-4 border-b border-gray-700 rounded-t flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-200">Prisoner Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 border-b border-gray-700 pb-2 mb-2">
                <DetailItem label="Name" value={prisoner.name} />
                <DetailItem label="Father's Name" value={prisoner.fatherName} />
                <DetailItem label="Convict #" value={prisoner.convictNo} />
                <DetailItem label="Status" value={<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prisoner.status)}`}>{prisoner.status}</span>} />
                <DetailItem label="Category" value={prisoner.category} />
                <DetailItem label="Nationality" value={prisoner.nationality} />
            </div>

            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 border-b border-gray-700 pb-2 mb-2">
                <DetailItem label="Crime Type" value={prisoner.crimeType} />
                <DetailItem label="Admission Date" value={prisoner.admissionDate} />
                <DetailItem label="Sentence Date" value={prisoner.sentenceDate} />
                <DetailItem label="Sentence" value={prisoner.sentence} />
                <DetailItem label="District" value={prisoner.district} />
                <DetailItem label="Under Section" value={prisoner.underSection} />
                <DetailItem label="Crime No." value={prisoner.crimeNo} />
                <DetailItem label="Police Station (PS)" value={prisoner.ps} />
                <DetailItem label="Sentencing Court" value={prisoner.sentencingCourt} />
            </div>
            
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 border-b border-gray-700 pb-2 mb-2">
                <DetailItem label="Fine/ Daman/ Diyat/ Arsh" value={prisoner.runningIn} />
                <DetailItem label="Amount" value={prisoner.amount > 0 ? prisoner.amount.toLocaleString() : 'N/A'} />
                <DetailItem label="In Default of Payment" value={prisoner.defaultOfPayment} />
                <DetailItem label="High Court Case No." value={prisoner.highCourtCaseNo} />
                <DetailItem label="High Court Status" value={prisoner.highCourtStatus} />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <DetailItem label="Special Remarks" value={prisoner.specialRemarks} />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <DetailItem label="Medical Report" value={prisoner.medicalReport} />
            </div>
          </dl>
        </div>
        <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b mt-auto flex justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-4 rounded transition">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PrisonerDetailsModal;