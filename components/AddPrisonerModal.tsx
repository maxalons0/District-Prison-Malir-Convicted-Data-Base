import React, { useState, useEffect } from 'react';
import type { Prisoner, PrisonerFormModalProps } from '../types';
import { Status, Category, ForeignerNationality, FineType } from '../types';

const initialFormData = {
    convictNo: '', admissionDate: '', sentenceDate: '', name: '', fatherName: '',
    district: '', underSection: '', crimeNo: '', ps: '', sentencingCourt: '', sentence: '',
    runningIn: FineType.NA, amount: 0, defaultOfPayment: '', specialRemarks: '', crimeType: '',
    nationality: 'Pakistani', status: Status.Confined, category: Category.GeneralConvict,
    medicalReport: '', highCourtCaseNo: '', highCourtStatus: '',
};

// Add "Other" to the list of selectable foreigner nationalities
const FOREIGNER_NATIONALITIES = [...Object.values(ForeignerNationality), 'Other'];

const PrisonerFormModal: React.FC<PrisonerFormModalProps> = ({ isOpen, onClose, onSave, prisonerToEdit }) => {
  const [formData, setFormData] = useState(initialFormData);
  const isEditMode = !!prisonerToEdit;

  useEffect(() => {
    if (isEditMode) {
      // If editing, populate form with prisoner data
      const { id, sNo, statusUpdateDate, ...editableData } = prisonerToEdit;
      setFormData({
          ...initialFormData, // Start with defaults to ensure new fields exist
          ...editableData,
          amount: editableData.amount || 0, // ensure amount is a number
      });
    } else {
      // If adding, reset to initial form data
      setFormData(initialFormData);
    }
  }, [prisonerToEdit, isOpen]);


  useEffect(() => {
    // This effect handles the user changing the category in the form.
    if (formData.category === Category.Foreigner) {
        // If we switch to foreigner category and current nationality is Pakistani, default to a common foreigner one.
        // This prevents keeping "Pakistani" for a foreigner.
        if (formData.nationality === 'Pakistani') {
            setFormData(prev => ({ ...prev, nationality: ForeignerNationality.Indian }));
        }
    } else {
        // If we switch to a non-foreigner category, nationality must be Pakistani.
        setFormData(prev => ({ ...prev, nationality: 'Pakistani' }));
    }
  }, [formData.category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const handleNationalitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === 'Other') {
        // When "Other" is selected, clear the nationality to allow custom input
        setFormData(prev => ({ ...prev, nationality: '' }));
    } else {
        // For any predefined selection, just update the value
        setFormData(prev => ({ ...prev, nationality: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Prisoner, 'id' | 'sNo' | 'statusUpdateDate'>, prisonerToEdit?.id);
    onClose();
  };

  if (!isOpen) return null;

  // Check if the current nationality is a custom one (i.e., not one of the predefined enum values)
  const isOtherNationalitySelected = formData.category === Category.Foreigner && !Object.values(ForeignerNationality).includes(formData.nationality as ForeignerNationality);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-700">
        <div className="bg-gray-900 p-4 border-b border-gray-700 rounded-t">
            <h2 className="text-xl font-bold text-gray-200">{isEditMode ? 'Edit Prisoner Details' : 'Add New Prisoner'}</h2>
        </div>
        <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Form Fields */}
                <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                <InputField label="Convict #" name="convictNo" value={formData.convictNo} onChange={handleChange} required />
                <InputField label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} required />
                <InputField label="Sentence Date" name="sentenceDate" type="date" value={formData.sentenceDate} onChange={handleChange} required />
                
                <SelectField label="Category" name="category" value={formData.category} onChange={handleChange}>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </SelectField>

                {formData.category === Category.Foreigner ? (
                    <>
                        <SelectField 
                            label="Nationality" 
                            name="nationalitySelect" // Non-state name to prevent conflict
                            value={isOtherNationalitySelected ? 'Other' : formData.nationality} 
                            onChange={handleNationalitySelectChange}
                        >
                            {FOREIGNER_NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                        </SelectField>
                        
                        {isOtherNationalitySelected && (
                            <InputField 
                                label="Specify Nationality" 
                                name="nationality" 
                                value={formData.nationality} 
                                onChange={handleChange} 
                                required 
                                placeholder="Enter nationality"
                            />
                        )}
                    </>
                ) : (
                    <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} required />
                )}

                <InputField label="District" name="district" value={formData.district} onChange={handleChange} required />
                <InputField label="Crime Type" name="crimeType" value={formData.crimeType} onChange={handleChange} placeholder="e.g., Theft, Assault" required />
                <InputField label="Under Section" name="underSection" value={formData.underSection} onChange={handleChange} />
                <InputField label="Crime No." name="crimeNo" value={formData.crimeNo} onChange={handleChange} />
                <InputField label="Police Station (PS)" name="ps" value={formData.ps} onChange={handleChange} />
                <InputField label="Sentencing Court" name="sentencingCourt" value={formData.sentencingCourt} onChange={handleChange} />
                <InputField label="Sentence" name="sentence" value={formData.sentence} onChange={handleChange} placeholder="e.g., 10 Years RI" />
                
                <SelectField label="Status" name="status" value={formData.status} onChange={handleChange}>
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                
                <SelectField label="Fine/ Daman/ Diyat/ Arsh" name="runningIn" value={formData.runningIn} onChange={handleChange}>
                    {Object.values(FineType).map(ft => <option key={ft} value={ft}>{ft}</option>)}
                </SelectField>
                <InputField label="Amount" name="amount" type="number" value={formData.amount.toString()} onChange={handleChange} />
                <InputField label="In Default of Payment" name="defaultOfPayment" value={formData.defaultOfPayment} onChange={handleChange} />
                
                <InputField label="High Court Case No." name="highCourtCaseNo" value={formData.highCourtCaseNo} onChange={handleChange} />
                <InputField label="High Court Status" name="highCourtStatus" value={formData.highCourtStatus} onChange={handleChange} />

                <div className="md:col-span-2 lg:col-span-3">
                  <label htmlFor="specialRemarks" className="block text-sm font-medium text-gray-300 mb-1">Special Remarks</label>
                  <textarea id="specialRemarks" name="specialRemarks" value={formData.specialRemarks} onChange={handleChange} rows={2} className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                 <div className="md:col-span-2 lg:col-span-3">
                  <label htmlFor="medicalReport" className="block text-sm font-medium text-gray-300 mb-1">Medical Report</label>
                  <textarea id="medicalReport" name="medicalReport" value={formData.medicalReport} onChange={handleChange} rows={3} className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
              </div>
              {/* This div is for layout and doesn't need to be part of the form submission */}
              <div className="mt-6 flex justify-end space-x-4 sr-only">
                <button type="submit">Submit</button>
              </div>
            </form>
        </div>
        <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-gray-100 font-bold py-2 px-4 rounded transition">Cancel</button>
            <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white font-bold py-2 px-4 rounded transition">{isEditMode ? 'Save Changes' : 'Save Prisoner'}</button>
          </div>
      </div>
    </div>
  );
};

// Helper components for form fields
interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', required = false, placeholder='' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-400">*</span>}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
    </div>
);

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="w-full bg-gray-700 border-gray-600 rounded shadow-sm p-2 text-gray-100 focus:ring-blue-500 focus:border-blue-500">
            {children}
        </select>
    </div>
);

export default PrisonerFormModal;