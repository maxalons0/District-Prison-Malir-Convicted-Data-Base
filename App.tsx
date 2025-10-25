
import React, { useState, useMemo, useRef } from 'react';
import type { Prisoner, Filters, Page, SortConfig, ChatMessage } from './types';
import { Status, Category, FineType } from './types';
import { initialPrisonerData } from './mockData';
import Header from './components/Header';
import FilterControls from './components/FilterControls';
import PrisonerTable from './components/PrisonerTable';
import PrisonerFormModal from './components/AddPrisonerModal'; // Renamed component
import DateRangeReportModal from './components/DateRangeReportModal';
import { generateReport, generateDateRangeReport, processImportDataWithAI, askGemini } from './services/geminiService';
import PaginationControls from './components/PaginationControls';
import PrisonerDetailsModal from './components/PrisonerDetailsModal';
import StatusBar from './components/StatusBar';
import Chatbot from './components/Chatbot';

// Declare XLSX to inform TypeScript about the global variable from the script tag
declare var XLSX: any;

const ROWS_PER_PAGE = 10;

// Main App Component
const App: React.FC = () => {
    // State management
    const [prisoners, setPrisoners] = useState<Prisoner[]>(initialPrisonerData);
    const [filters, setFilters] = useState<Filters>({
        nationality: '', category: 'All', crimeType: '',
        status: 'All', searchTerm: '', underSection: '',
    });
    const [currentPage, setCurrentPage] = useState<Page>('Home');
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isDateModalOpen, setDateModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
    const [prisonerToEdit, setPrisonerToEdit] = useState<Prisoner | null>(null);
    const [paginationPage, setPaginationPage] = useState(0);
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [importMode, setImportMode] = useState<'normal' | 'ai'>('normal');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! How can I help you with the prisoner data today?' }
    ]);
    const [isChatbotLoading, setIsChatbotLoading] = useState(false);
    
    // Derived state and unique filter options
    const uniqueNationalities = useMemo(() => [...new Set(prisoners.map(p => p.nationality))], [prisoners]);
    const uniqueCrimeTypes = useMemo(() => [...new Set(prisoners.map(p => p.crimeType))], [prisoners]);
    const uniqueUnderSections = useMemo(() => [...new Set(prisoners.map(p => p.underSection))], [prisoners]);
    
    // Filter logic
    const filteredPrisoners = useMemo(() => {
        let data = prisoners;

        // Page-level filtering
        switch (currentPage) {
            case 'General': data = data.filter(p => p.category === Category.GeneralConvict && p.status === Status.Confined); break;
            case 'Civil': data = data.filter(p => p.category === Category.Civil && p.status === Status.Confined); break;
            case 'Foreigner': data = data.filter(p => p.category === Category.Foreigner && p.status === Status.Confined); break;
            case 'Detainees': data = data.filter(p => p.category === Category.Detainee); break;
            case 'FineRelated': data = data.filter(p => p.runningIn !== FineType.NA); break;
            case 'Released': data = data.filter(p => p.status === Status.Released || p.status === Status.ExpiredSentence); break;
        }

        return data.filter(p =>
            (filters.nationality ? p.nationality === filters.nationality : true) &&
            (filters.category !== 'All' ? p.category === filters.category : true) &&
            (filters.crimeType ? p.crimeType === filters.crimeType : true) &&
            (filters.underSection ? p.underSection === filters.underSection : true) &&
            (filters.status !== 'All' ? p.status === filters.status : true) &&
            (filters.searchTerm
                ? p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                  p.convictNo.toLowerCase().includes(filters.searchTerm.toLowerCase())
                : true)
        );
    }, [prisoners, filters, currentPage]);

    const sortedPrisoners = useMemo(() => {
        if (!sortConfig) {
            return filteredPrisoners;
        }

        const sorted = [...filteredPrisoners].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return sorted;
    }, [filteredPrisoners, sortConfig]);

    const paginatedPrisoners = useMemo(() => {
        const startIndex = paginationPage * ROWS_PER_PAGE;
        return sortedPrisoners.slice(startIndex, startIndex + ROWS_PER_PAGE);
    }, [sortedPrisoners, paginationPage]);

    const totalPages = Math.ceil(sortedPrisoners.length / ROWS_PER_PAGE);

    // Handlers
    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        setPaginationPage(0); // Reset to first page on filter change
    };

    const handleSort = (key: keyof Prisoner) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setPaginationPage(0); // Reset to first page on sort change
    };

    const handlePageChange = (page: Page) => {
        setCurrentPage(page);
        setPaginationPage(0);
        setSortConfig(null);
        setFilters({
            nationality: '', category: 'All', crimeType: '',
            status: 'All', searchTerm: '', underSection: '',
        });
    };

    const handleSavePrisoner = (prisonerData: Omit<Prisoner, 'id' | 'sNo' | 'statusUpdateDate'>, id?: string) => {
        if (id) { // Editing existing prisoner
            setPrisoners(prev => prev.map(p => p.id === id ? { ...p, ...prisonerData, statusUpdateDate: new Date().toISOString().split('T')[0] } : p));
        } else { // Adding new prisoner
            const newPrisoner: Prisoner = {
                ...prisonerData,
                id: `P${Date.now()}`,
                sNo: prisoners.length > 0 ? Math.max(...prisoners.map(p => p.sNo)) + 1 : 1,
                statusUpdateDate: new Date().toISOString().split('T')[0],
            };
            setPrisoners(prev => [...prev, newPrisoner]);
        }
    };
    
    const handleOpenAddModal = () => {
        setPrisonerToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (prisoner: Prisoner) => {
        setPrisonerToEdit(prisoner);
        setFormModalOpen(true);
    };

    const handleViewDetails = (prisoner: Prisoner) => {
        setSelectedPrisoner(prisoner);
        setDetailsModalOpen(true);
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true); setReportContent('');
        try {
            const report = await generateReport(sortedPrisoners, filters);
            setReportContent(report); setReportModalOpen(true);
        } catch (error) {
            console.error(error); setReportContent('Failed to generate report. See console for details.'); setReportModalOpen(true);
        } finally {
            setIsGeneratingReport(false);
        }
    };
    
    const exportToCSV = () => {
        if (sortedPrisoners.length === 0) return;
        const headers = Object.keys(sortedPrisoners[0]).join(',');
        const rows = sortedPrisoners.map(p => Object.values(p).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prisoners_export.csv';
        link.click();
    };
    
    const handleGenerateDateReport = async (startDate: string, endDate: string, sections: string[]) => {
        setDateModalOpen(false); setIsGeneratingReport(true); setReportContent('');
        try {
            const report = await generateDateRangeReport(prisoners, startDate, endDate, sections);
            setReportContent(report); setReportModalOpen(true);
        } catch (error) {
            console.error(error); setReportContent('Failed to generate detailed report.'); setReportModalOpen(true);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleImportClick = () => {
        setImportMode('normal');
        fileInputRef.current?.click();
    };

    const handleAiImportClick = () => {
        setImportMode('ai');
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (importMode === 'ai') {
            processAiImport(file);
        } else {
            processNormalImport(file);
        }

        if (event.target) {
            event.target.value = ''; // Reset to allow re-uploading the same file
        }
    };

    const formatDate = (excelDate: any): string => {
        if (!excelDate) return '';
    
        // If it's already a JS Date object from cellDates:true
        if (excelDate instanceof Date) {
            if (!isNaN(excelDate.getTime())) {
                // Adjust for timezone offset. excelDate is likely parsed as UTC.
                const tzOffset = excelDate.getTimezoneOffset() * 60000;
                const localDate = new Date(excelDate.getTime() - tzOffset);
                return localDate.toISOString().split('T')[0];
            }
            return '';
        }
    
        // If it's a number (Excel serial date)
        if (typeof excelDate === 'number') {
            // Formula to convert Excel serial date to JS Date. 25569 is days between 1900 and 1970 (Excel's epoch).
            const date = new Date((excelDate - 25569) * 86400 * 1000);
            if (!isNaN(date.getTime())) {
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localDate = new Date(date.getTime() - tzOffset);
                return localDate.toISOString().split('T')[0];
            }
            return '';
        }
    
        // If it's a string, try to parse it
        if (typeof excelDate === 'string') {
            const date = new Date(excelDate);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
        }
    
        return ''; // Return empty string if conversion fails
    };

    const processAiImport = async (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rawJson = XLSX.utils.sheet_to_json(worksheet);

                if (rawJson.length === 0) throw new Error("File is empty or could not be read.");
                
                const processedData = await processImportDataWithAI(rawJson);
                
                if (processedData.length === 0) {
                    alert("AI processing complete, but no valid records were found. Please check the file content.");
                    return;
                }

                setPrisoners(prev => {
                    let maxSNo = prev.length > 0 ? Math.max(...prev.map(p => p.sNo)) : 0;
                    const newPrisoners = processedData
                        .filter(p => p.convictNo && p.name && p.admissionDate) // Final validation
                        .map((p): Prisoner => {
                            maxSNo++;
                            return {
                                id: `ai-imported-${Date.now()}-${maxSNo}`, sNo: maxSNo,
                                convictNo: p.convictNo || '', admissionDate: p.admissionDate || '',
                                sentenceDate: p.sentenceDate || '', name: p.name || '',
                                fatherName: p.fatherName || '', district: p.district || '',
                                underSection: p.underSection || '', crimeNo: p.crimeNo || '',
                                ps: p.ps || '', sentencingCourt: p.sentencingCourt || '',
                                sentence: p.sentence || '',
                                runningIn: (Object.values(FineType).includes(p.runningIn as FineType) ? p.runningIn : FineType.NA) as FineType,
                                amount: Number(p.amount) || 0,
                                defaultOfPayment: p.defaultOfPayment || '',
                                specialRemarks: p.specialRemarks || '', medicalReport: p.medicalReport || '',
                                highCourtCaseNo: p.highCourtCaseNo || '', highCourtStatus: p.highCourtStatus || '',
                                crimeType: p.crimeType || 'N/A', nationality: p.nationality || 'Pakistani',
                                status: (Object.values(Status).includes(p.status as Status) ? p.status : Status.Confined) as Status,
                                category: (Object.values(Category).includes(p.category as Category) ? p.category : Category.GeneralConvict) as Category,
                                statusUpdateDate: p.statusUpdateDate || new Date().toISOString().split('T')[0],
                            };
                    });
                    
                    if (newPrisoners.length === 0) {
                         alert("AI processed the file, but no records passed validation. Ensure convict number, name, and admission date are present.");
                         return prev;
                    }
                    alert(`${newPrisoners.length} records imported successfully with AI!`);
                    return [...prev, ...newPrisoners];
                });

            } catch (error: any) {
                console.error("Error during AI import:", error);
                alert(`AI Import failed: ${error.message}`);
            } finally {
                setIsImporting(false);
            }
        };
        reader.onerror = () => { alert('Failed to read the file.'); setIsImporting(false); };
        reader.readAsBinaryString(file);
    };

    const processNormalImport = (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });

                const newPrisoners: Omit<Prisoner, 'id' | 'sNo'>[] = json.map((row: any, index: number) => {
                    if (!row.convictNo || !row.name || !row.admissionDate) {
                        throw new Error(`Row ${index + 2} is missing required data (convictNo, name, admissionDate are required).`);
                    }
                    return {
                        convictNo: String(row.convictNo),
                        admissionDate: formatDate(row.admissionDate),
                        sentenceDate: formatDate(row.sentenceDate) || '',
                        name: String(row.name), fatherName: String(row.fatherName || ''),
                        district: String(row.district || ''), underSection: String(row.underSection || ''),
                        crimeNo: String(row.crimeNo || ''), ps: String(row.ps || ''),
                        sentencingCourt: String(row.sentencingCourt || ''), sentence: String(row.sentence || ''),
                        runningIn: (Object.values(FineType).includes(row.runningIn) ? row.runningIn : FineType.NA) as FineType,
                        amount: Number(row.amount) || 0, defaultOfPayment: String(row.defaultOfPayment || ''),
                        specialRemarks: String(row.specialRemarks || ''), medicalReport: String(row.medicalReport || ''),
                        highCourtCaseNo: String(row.highCourtCaseNo || ''), highCourtStatus: String(row.highCourtStatus || ''),
                        crimeType: String(row.crimeType || 'N/A'), nationality: String(row.nationality || 'Pakistani'),
                        status: (Object.values(Status).includes(row.status) ? row.status : Status.Confined) as Status,
                        category: (Object.values(Category).includes(row.category) ? row.category : Category.GeneralConvict) as Category,
                        statusUpdateDate: formatDate(row.statusUpdateDate) || new Date().toISOString().split('T')[0],
                    };
                });

                setPrisoners(prev => {
                    let maxSNo = prev.length > 0 ? Math.max(...prev.map(p => p.sNo)) : 0;
                    const processedNewPrisoners = newPrisoners.map((p): Prisoner => {
                        maxSNo++;
                        return { ...p, id: `imported-${Date.now()}-${maxSNo}`, sNo: maxSNo };
                    });
                    return [...prev, ...processedNewPrisoners];
                });
                alert(`${newPrisoners.length} records imported successfully!`);
            } catch (error: any) {
                console.error("Error importing data:", error);
                alert(`Import failed: ${error.message}`);
            } finally {
                setIsImporting(false);
            }
        };
        reader.onerror = () => { alert('Failed to read the file.'); setIsImporting(false); };
        reader.readAsBinaryString(file);
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 'General': return 'Confined General Convicts';
            case 'Civil': return 'Confined Civil Prisoners';
            case 'Foreigner': return 'Confined Foreigner Prisoners';
            case 'Detainees': return 'Detainees';
            case 'FineRelated': return 'Fine / Daman / Diyat / Arsh Cases';
            case 'Released': return 'Released / Expired Sentence';
            default: return 'Malir Prison & C.F karachi';
        }
    };

    const submitMessageToGemini = async (message: string) => {
        setIsChatbotLoading(true);
    
        if (!navigator.onLine) {
            const errorMessage: ChatMessage = { role: 'model', text: 'You seem to be offline. Please check your internet connection and try again.' };
            setTimeout(() => {
                setChatMessages(prev => [...prev, errorMessage]);
                setIsChatbotLoading(false);
            }, 500);
            return;
        }
    
        try {
            const responseText = await askGemini(message);
            const newModelMessage: ChatMessage = { role: 'model', text: responseText };
            setChatMessages(prev => [...prev, newModelMessage]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            const errorMessage: ChatMessage = { 
                role: 'error', 
                text: 'Sorry, I ran into a problem processing your request.',
                originalUserMessage: message
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsChatbotLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { role: 'user', text: message };
        setChatMessages(prev => [...prev, newUserMessage]);
        await submitMessageToGemini(message);
    };
    
    const handleRetry = async (messageToRetry: string) => {
        // Remove the previous error message from the chat history
        setChatMessages(prev => prev.filter(msg => msg.role !== 'error'));
        await submitMessageToGemini(messageToRetry);
    };

    const isBusy = isGeneratingReport || isImporting;

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Header 
                onAddPrisoner={handleOpenAddModal} 
                onImportClick={handleImportClick}
                onAiImportClick={handleAiImportClick}
                onExport={exportToCSV}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                pageTitle={getPageTitle()}
            />
            <main className="p-4 md:p-6 flex-grow">
                <FilterControls
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onGenerateReport={handleGenerateReport}
                    onOpenDateModal={() => setDateModalOpen(true)}
                    isGeneratingReport={isGeneratingReport}
                    isBusy={isBusy}
                    uniqueNationalities={uniqueNationalities}
                    uniqueCrimeTypes={uniqueCrimeTypes}
                    uniqueUnderSections={uniqueUnderSections}
                    page={currentPage}
                />
                <PrisonerTable 
                    prisoners={paginatedPrisoners} 
                    onViewDetails={handleViewDetails}
                    onEdit={handleOpenEditModal}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
                <PaginationControls 
                    currentPage={paginationPage}
                    totalPages={totalPages}
                    onPageChange={setPaginationPage}
                />
            </main>
            
            <StatusBar 
                totalRecords={sortedPrisoners.length}
                currentPage={paginationPage}
                totalPages={totalPages}
            />

            {/* AI Assistant Floating Action Button */}
            <div className="fixed bottom-5 right-5 z-40">
                <button
                    onClick={() => setIsChatbotModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Open AI Assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </button>
            </div>
            
            <Chatbot
                isOpen={isChatbotModalOpen}
                onClose={() => setIsChatbotModalOpen(false)}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatbotLoading}
                onRetry={handleRetry}
            />

            <PrisonerFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSavePrisoner}
                prisonerToEdit={prisonerToEdit}
            />
            <PrisonerDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                prisoner={selectedPrisoner}
            />
            <DateRangeReportModal 
                isOpen={isDateModalOpen}
                onClose={() => setDateModalOpen(false)}
                onGenerate={handleGenerateDateReport}
            />
            {isReportModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-gray-800 rounded shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
                        <div className="bg-gray-900 p-4 border-b border-gray-700 rounded-t flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-200">AI Generated Report</h2>
                            <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                        </div>
                        <div className="prose prose-sm md:prose-base max-w-none bg-gray-800 p-4 overflow-y-auto text-gray-200" style={{ whiteSpace: 'pre-wrap' }}>
                           {reportContent}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
