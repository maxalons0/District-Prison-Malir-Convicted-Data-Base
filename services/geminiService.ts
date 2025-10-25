import { GoogleGenAI, Type } from "@google/genai";
import type { Prisoner, Filters } from '../types';
import { Status, FineType, Category } from "../types";

// The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    // In a real app, you might want to handle this more gracefully,
    // but for this context, throwing an error is clear.
    throw new Error("API_KEY environment variable not set");
}
// Always use `const ai = new GoogleGenAI({apiKey: process.env.API_KEY});`.
const ai = new GoogleGenAI({ apiKey });

export const generateReport = async (prisoners: Prisoner[], filters: Filters): Promise<string> => {
    // A function to create a simplified prisoner object for the prompt to save tokens and focus the model
    const simplifyPrisoner = (p: Prisoner) => ({
        category: p.category,
        status: p.status,
        crimeType: p.crimeType,
        nationality: p.nationality,
        sentence: p.sentence,
        admissionDate: p.admissionDate,
    });

    const simplifiedData = prisoners.map(simplifyPrisoner);

    const prompt = `
    Analyze the following dataset of prisoners from District Prison Malir.
    The data is provided in JSON format.
    
    Dataset:
    ${JSON.stringify(simplifiedData, null, 2)}

    Current Filters Applied:
    - Nationality: ${filters.nationality || 'All'}
    - Category: ${filters.category || 'All'}
    - Crime Type: ${filters.crimeType || 'All'}
    - Status: ${filters.status || 'All'}
    - Under Section: ${filters.underSection || 'All'}

    Based on the provided data and filters, generate a concise and insightful report. The report should summarize key statistics and trends.
    Structure the report with the following sections in Markdown format:
    1.  **Overall Summary:** A brief overview of the filtered prisoner population.
    2.  **Key Statistics:** Use bullet points for key numbers (e.g., total prisoners, breakdown by status, most common crime type).
    3.  **Trends & Insights:** Identify any notable patterns or insights (e.g., a high number of prisoners for a specific crime, trends in admission dates).

    The tone should be formal and analytical. Do not just list the data; provide interpretation. If the dataset is empty, state that no data matches the filters.
    `;

    try {
        // Per guidelines, use gemini-2.5-flash for basic text tasks
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Per guidelines, access the text directly from the response object
        return response.text;
    } catch (error) {
        console.error("Error generating report with Gemini API:", error);
        return "Error: Could not generate the report. Please check the API key and network connection.";
    }
};

const createFrequencyMap = (data: Prisoner[], key: keyof Prisoner) => {
    return data.reduce((acc, item) => {
        const value = item[key] || 'N/A';
        // Ensure value is a string for consistent keying
        const stringValue = String(value);
        acc[stringValue] = (acc[stringValue] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
};


export const generateDateRangeReport = async (
    allPrisoners: Prisoner[],
    startDate: string,
    endDate: string,
    sections: string[]
): Promise<string> => {
    
    let dataForPrompt = '';
    let promptInstructions = `Generate a detailed report for District Prison Malir for the period from ${startDate} to ${endDate}.\n\nBased on the data provided, generate a report with the following structure in Markdown format. Only include the sections that have been requested.\n\n# Report for District Prison Malir\n**Period:** ${startDate} to ${endDate}.\n\n`;

    const needsAdmissionsData = sections.includes('admissions') || sections.some(s => s.startsWith('breakdownBy'));
    const newAdmissions = needsAdmissionsData
        ? allPrisoners.filter(p => p.admissionDate >= startDate && p.admissionDate <= endDate)
        : [];

    if (sections.includes('admissions')) {
        const simplifiedAdmissions = newAdmissions.map(p => ({ name: p.name, convictNo: p.convictNo, admissionDate: p.admissionDate, sentence: p.sentence }));
        dataForPrompt += `Data for New Admissions in this period:\n${JSON.stringify(simplifiedAdmissions, null, 2)}\n\n`;
        promptInstructions += `## Admissions Summary
*   Total New Admissions: ${newAdmissions.length}
*   **Sentence Breakdown for New Admissions:** Analyze the provided sentences and categorize them (e.g., "Short-term (under 5 years)", "Medium-term (5-15 years)", "Long-term (over 15 years)", "Life Imprisonment", "Under Investigation/Other"). Provide a count for each category you define.\n\n`;
    }

    const releasedPrisoners = (sections.includes('releases') || sections.includes('sentenceCompletion'))
        ? allPrisoners.filter(p => (p.status === Status.Released || p.status === Status.ExpiredSentence) && p.statusUpdateDate >= startDate && p.statusUpdateDate <= endDate)
        : [];

    if (sections.includes('releases')) {
        const simplifiedReleases = releasedPrisoners.map(p => ({ name: p.name, convictNo: p.convictNo, status: p.status, releaseDate: p.statusUpdateDate }));
        dataForPrompt += `Data for Released Prisoners in this period:\n${JSON.stringify(simplifiedReleases, null, 2)}\n\n`;
        promptInstructions += `## Releases Summary
*   Total Released Prisoners: ${releasedPrisoners.length}
*   List the names and convict numbers of the prisoners released during this period.\n\n`;
    }

    if (sections.includes('sentenceCompletion')) {
        const allConfined = allPrisoners.filter(p => p.status === Status.Confined);
        const simplifiedConfined = allConfined.map(p => ({ name: p.name, convictNo: p.convictNo, sentence: p.sentence, sentenceDate: p.sentenceDate }));
        
        if (!sections.includes('releases')) {
            const simplifiedReleases = releasedPrisoners.map(p => ({ name: p.name, convictNo: p.convictNo, status: p.status, releaseDate: p.statusUpdateDate }));
            dataForPrompt += `Data for Released Prisoners in this period:\n${JSON.stringify(simplifiedReleases, null, 2)}\n\n`;
        }
        dataForPrompt += `Data for All Currently Confined Prisoners (for sentence analysis):\n${JSON.stringify(simplifiedConfined, null, 2)}\n\n`;
        
        promptInstructions += `## Sentence Completion Analysis
*   **Nearing Completion:** Based on the 'All Currently Confined Prisoners' data (using their sentence and sentenceDate), identify any prisoners whose sentences are likely to end in the near future (e.g., within the next 6 months from ${endDate}). List their name, convict number, sentence, and sentence date. If none, state that.
*   **Completed During Period:** From the 'Released Prisoners' data, list those whose status is 'Expired Sentence'. If none, state that.\n\n`;
    }
    
    if (sections.includes('fineRelated')) {
        const confinedForNonPayment = allPrisoners.filter(p =>
            p.status === Status.Confined &&
            p.runningIn !== FineType.NA &&
            p.amount > 0
        );
        const simplifiedNonPayment = confinedForNonPayment.map(p => ({ name: p.name, convictNo: p.convictNo, runningIn: p.runningIn, amount: p.amount }));
        dataForPrompt += `Data for Prisoners Confined due to Non-Payment of Fines/Diyat/etc.:\n${JSON.stringify(simplifiedNonPayment, null, 2)}\n\n`;
        promptInstructions += `## Fine & Diyat Related Confinements
*   Total prisoners currently confined due to non-payment: ${confinedForNonPayment.length}
*   List the names, convict numbers, the type of penalty (e.g., Fine, Diyat), and the amount for each prisoner confined for this reason. If none, state that.\n\n`;
    }

    const breakdownMappings: { [key: string]: { dataKey: keyof Prisoner; title: string } } = {
        breakdownByCategory: { dataKey: 'category', title: 'Admissions by Category' },
        breakdownByCrimeType: { dataKey: 'crimeType', title: 'Admissions by Crime Type' },
        breakdownByDistrict: { dataKey: 'district', title: 'Admissions by District' },
        breakdownByNationality: { dataKey: 'nationality', title: 'Admissions by Nationality' },
        breakdownByPS: { dataKey: 'ps', title: 'Admissions by Police Station' },
        breakdownByCourt: { dataKey: 'sentencingCourt', title: 'Admissions by Sentencing Court' },
        breakdownBySection: { dataKey: 'underSection', title: 'Admissions by Under Section' },
    };

    for (const section of sections) {
        if (breakdownMappings[section]) {
            const { dataKey, title } = breakdownMappings[section];
            const frequencyMap = createFrequencyMap(newAdmissions, dataKey);
            
            if (Object.keys(frequencyMap).length > 0) {
                dataForPrompt += `Data for ${title}:\n${JSON.stringify(frequencyMap, null, 2)}\n\n`;
                promptInstructions += `## ${title}\n*   Analyze the provided frequency map for '${title}'. List the top entries with their counts and provide a brief summary of the distribution.\n\n`;
            } else {
                 promptInstructions += `## ${title}\n*   No new admissions data to analyze for this breakdown.\n\n`;
            }
        }
    }

    promptInstructions += `Provide a concise, formal summary for each requested section. If a section has no data, state it clearly.`;

    const prompt = `${dataForPrompt}\n${promptInstructions}`;
    
    try {
        // Per guidelines, use gemini-2.5-flash for basic text tasks
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating date range report with Gemini API:", error);
        return "Error: Could not generate the detailed report.";
    }
};

export const processImportDataWithAI = async (rawData: any[]): Promise<Partial<Prisoner>[]> => {
    if (!rawData || rawData.length === 0) {
        return [];
    }

    const prisonerSchema = {
        type: Type.OBJECT,
        properties: {
            convictNo: { type: Type.STRING, description: "Convict number/ID. This is a required field." },
            admissionDate: { type: Type.STRING, description: "Date of admission in YYYY-MM-DD format. This is a required field." },
            sentenceDate: { type: Type.STRING, description: "Date of sentencing in YYYY-MM-DD format. Can be empty string." },
            name: { type: Type.STRING, description: "Prisoner's full name. This is a required field." },
            fatherName: { type: Type.STRING, description: "Prisoner's father's name. Can be empty string." },
            district: { type: Type.STRING },
            underSection: { type: Type.STRING, description: "Legal section under which convicted" },
            crimeNo: { type: Type.STRING },
            ps: { type: Type.STRING, description: "Police Station" },
            sentencingCourt: { type: Type.STRING },
            sentence: { type: Type.STRING, description: "Length and type of sentence" },
            runningIn: { type: Type.STRING, description: `Type of fine. Must be one of: ${Object.values(FineType).join(', ')}` },
            amount: { type: Type.NUMBER, description: "Fine amount. Must be a number." },
            defaultOfPayment: { type: Type.STRING, description: "Consequence for not paying the fine" },
            specialRemarks: { type: Type.STRING },
            medicalReport: { type: Type.STRING },
            highCourtCaseNo: { type: Type.STRING },
            highCourtStatus: { type: Type.STRING },
            crimeType: { type: Type.STRING },
            nationality: { type: Type.STRING },
            status: { type: Type.STRING, description: `Current status. Must be one of: ${Object.values(Status).join(', ')}. This is a required field.` },
            category: { type: Type.STRING, description: `Prisoner category. Must be one of: ${Object.values(Category).join(', ')}. This is a required field.` },
            statusUpdateDate: { type: Type.STRING, description: "Date of last status update in YYYY-MM-DD format. Can be empty string." },
        },
    };

    const importSchema = {
        type: Type.ARRAY,
        items: prisonerSchema
    };

    const prompt = `
You are an intelligent data processing assistant for the District Prison Malir Management System.
Your task is to analyze the raw JSON data extracted from an uploaded spreadsheet, and then clean, standardize, and map it to the required prisoner data structure.

**Instructions:**
1.  **Map Columns:** The source data may have different column names. Intelligently map them to the target schema. For example, "Convict ID" or "Number" should map to "convictNo". "Inmate Name" should map to "name". "F/Name" to "fatherName".
2.  **Standardize Data:**
    *   **Dates:** All dates (admissionDate, sentenceDate, statusUpdateDate) MUST be in 'YYYY-MM-DD' format. The source data might have different formats (e.g., 'DD/MM/YYYY', 'MM-DD-YY', Excel date numbers). Correctly interpret and convert them.
    *   **Status:** The 'status' field must be one of these exact values: '${Object.values(Status).join("', '")}'. Map common terms (e.g., "In Jail" -> "Confined", "Bailed Out" -> "On Bail", "Freed" -> "Released"). Default to "Confined" if unclear.
    *   **Category:** The 'category' field must be one of: '${Object.values(Category).join("', '")}'. Default to "General Convict" if unclear.
    *   **FineType (runningIn):** The 'runningIn' field must be one of: '${Object.values(FineType).join("', '")}'. Default to "N/A" if not specified.
    *   **Numbers:** Ensure 'amount' is a valid number. If it's not a number or missing, default to 0.
3.  **Handle Missing Data:** If a row is missing essential data for 'convictNo', 'name', or 'admissionDate', SKIP that entire row and do not include it in the output. For other non-required fields, use empty strings "" if data is not available.
4.  **Output:** Return ONLY a valid JSON array containing the processed prisoner objects, strictly adhering to the provided schema. Do not include any explanations, introductory text, or markdown formatting.

**Raw Data from Spreadsheet (first 100 rows):**
${JSON.stringify(rawData.slice(0, 100), null, 2)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: importSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        return parsedData as Partial<Prisoner>[];

    } catch (error) {
        console.error("Error processing import data with Gemini API:", error);
        throw new Error("The AI failed to process the import file. Please check the file format or try again.");
    }
};

export const askGemini = async (question: string): Promise<string> => {
    if (!question.trim()) {
        return "Please ask a question.";
    }

    const prompt = `
    You are an AI assistant for the District Prison Malir Management System. 
    Answer the user's question concisely. 
    The user's question is: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};