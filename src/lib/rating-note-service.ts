import type { RatingNote } from './definitions';

// In a real app, this would fetch from Firebase Storage
// For this prototype, we'll store the large SFDT string here to simulate it.
async function getSfdTemplateFromStorage(): Promise<string> {
    // This is a placeholder for a 40-page SFDT document template.
    // In a real application, you would use the Firebase Storage SDK:
    // const storage = getStorage();
    // const sfdtRef = ref(storage, 'templates/rating_note_template.sfdt');
    // const url = await getDownloadURL(sfdtRef);
    // const response = await fetch(url);
    // return await response.text();

    // For now, return a simple template with placeholders.
    const simpleTemplate = {
        "sfdt": JSON.stringify({
            "sections": [
                {
                    "blocks": [
                        { "inlines": [{ "text": "Company Name: {{COMPANY.NAME}}", "characterFormat": { "bold": true } }] },
                        { "inlines": [{ "text": "Industry: {{COMPANY.INDUSTRY}}" }] },
                        { "inlines": [{ "text": "" }] },
                        { "inlines": [{ "text": "Financial Highlights", "characterFormat": { "bold": true } }] },
                        {
                            "inlines": [
                                { "text": "Total Sales (FY24): " },
                                { "text": "{{FINANCIALS.TOTAL_SALES.FY24}}" }
                            ]
                        },
                        { "inlines": [{ "text": "" }] },
                        { "inlines": [{ "text": "Rating Recommendation", "characterFormat": { "bold": true } }] },
                        {
                            "inlines": [
                                { "text": "Long Term: " },
                                { "text": "{{RATING.RECOMMENDATION.LONG_TERM}}" }
                            ]
                        },
                         { "inlines": [{ "text": "" }] },
                        { "inlines": [{ "text": "Analyst Details", "characterFormat": { "bold": true } }] },
                        {
                            "inlines": [
                                { "text": "Primary Analyst: " },
                                { "text": "{{ANALYST.NAME}}" }
                            ]
                        }
                    ]
                }
            ]
        })
    };
    return simpleTemplate.sfdt;
}


// In a real app, this data would come from multiple Firestore collections.
// For this prototype, we simulate a single fetch that gets all required data.
async function getRatingDataFromFirestore(note: RatingNote): Promise<any> {
    // This is mock data. A real implementation would fetch from Firestore.
    return {
        COMPANY: {
            NAME: note.companyName,
            INDUSTRY: "Pharmaceuticals",
        },
        FINANCIALS: {
            TOTAL_SALES: {
                FY24: "1,250 Cr",
                FY23: "1,100 Cr"
            },
        },
        RATING: {
            RECOMMENDATION: {
                LONG_TERM: "CARE AA+; Stable",
                SHORT_TERM: "CARE A1+"
            }
        },
        ANALYST: {
            NAME: "Taha G",
            EMAIL: "taha.g@careedge.in"
        }
    };
}


/**
 * A simple data binding engine to replace placeholders in the SFDT.
 * @param sfdtString The raw SFDT template string.
 * @param data The JSON data to bind.
 * @returns A new SFDT string with placeholders replaced.
 */
function bindDataToSfdt(sfdtString: string, data: any): string {
    let boundSfdt = sfdtString;

    // Regex to find all placeholders like {{OBJECT.PROPERTY.SUB_PROPERTY}}
    const placeholderRegex = /\{\{([A-Z0-9_.-]+)\}\}/gi;

    boundSfdt = boundSfdt.replace(placeholderRegex, (match, placeholder) => {
        const path = placeholder.split('.');
        let value: any = data;

        try {
            for (const key of path) {
                value = value[key];
                if (value === undefined) {
                    throw new Error(`Path not found for ${placeholder}`);
                }
            }
            return String(value);
        } catch (error) {
            console.warn(`Placeholder '{{${placeholder}}}' not found in data. Leaving it as is.`);
            return match; // Return original placeholder if path is invalid
        }
    });

    return boundSfdt;
}


/**
 * Fetches the SFDT template and rating data, then binds them together.
 * This is the main service function to be called by the UI.
 * @param note The rating note metadata.
 * @returns The final, data-bound SFDT string ready for the editor.
 */
export async function getBoundRatingNoteSfdt(note: RatingNote): Promise<string> {
    
    // If the note already has content, it means it has been edited and saved.
    // In this case, we should load the saved content directly instead of rebinding the template.
    if (note.editorContent) {
        return note.editorContent;
    }
    
    // 1. Fetch the raw SFDT template and the JSON data concurrently.
    const [sfdtTemplate, ratingData] = await Promise.all([
        getSfdTemplateFromStorage(),
        getRatingDataFromFirestore(note)
    ]);

    // 2. Perform the data binding.
    const boundSfdt = bindDataToSfdt(sfdtTemplate, ratingData);

    return boundSfdt;
}
