export enum Status {
  Confined = 'Confined',
  OnBail = 'On Bail',
  Released = 'Released',
  ExpiredSentence = 'Expired Sentence',
  Detainee = 'Detainee',
}

export enum Category {
  GeneralConvict = 'General Convict',
  Civil = 'Civil',
  Detainee = 'Detainee',
  Foreigner = 'Foreigner',
}

export enum ForeignerNationality {
  Indian = 'Indian',
  Bangladeshi = 'Bangladeshi',
  Afghani = 'Afghani',
}

export enum FineType {
  Fine = 'Fine',
  Daman = 'Daman',
  Diyat = 'Diyat',
  Arsh = 'Arsh',
  NA = 'N/A',
}

export type Page = 'Home' | 'General' | 'Civil' | 'Foreigner' | 'Detainees' | 'Released' | 'FineRelated';

export interface Prisoner {
  id: string;
  sNo: number;
  convictNo: string;
  admissionDate: string;
  sentenceDate: string;
  name: string;
  fatherName: string;
  district: string;
  underSection: string;
  crimeNo: string;
  ps: string; // Police Station
  sentencingCourt: string;
  sentence: string;
  runningIn: FineType;
  amount: number;
  defaultOfPayment: string;
  specialRemarks: string;
  medicalReport: string;
  highCourtCaseNo: string;
  highCourtStatus: string;
  crimeType: string; // Renamed from category
  nationality: string;
  status: Status;
  category: Category;
  statusUpdateDate: string;
}

export interface Filters {
  nationality: string;
  category: Category | 'All';
  crimeType: string;
  status: Status | 'All';
  searchTerm: string;
  underSection: string;
}

export interface PrisonerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prisonerData: Omit<Prisoner, 'id' | 'sNo' | 'statusUpdateDate'>, id?: string) => void;
  prisonerToEdit?: Prisoner | null;
}

export type SortConfig = {
  key: keyof Prisoner;
  direction: 'ascending' | 'descending';
} | null;

export interface ChatMessage {
  role: 'user' | 'model' | 'error';
  text: string;
  originalUserMessage?: string; // The user message that caused the error, for retry
}
