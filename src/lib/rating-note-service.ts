
import type { RatingNoteDataSchema, TableDefinition } from './definitions';
import * as template from './rating-note-template.json';
import pako from 'pako';

// In a real app, this would fetch from Firebase Storage based on the path in the JSON
async function getSfdTemplateFromStorage(path: string): Promise<string> {
    console.log(`Loading template from local import: rating-note-template.json`);
    
    // The imported JSON is an object like { sfdt: "base64_string" }
    const base64String = (template as any).sfdt;

    try {
        // 1. Decode base64 to a Uint8Array
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 2. Decompress the gzipped data using pako
        const decompressed = pako.inflate(bytes, { to: 'string' });
        
        // 3. Return the decompressed SFDT JSON string
        return decompressed;

    } catch (error) {
        console.error("Failed to decode or decompress SFDT content:", error);
        // Fallback to an error message if anything goes wrong
        return JSON.stringify({ "sfdt": "{\"sections\":[{\"blocks\":[{\"inlines\":[{\"text\":\"Error: Could not load or parse the document template.\"}]}]}]}" });
    }
}


/**
 * A simple data binding engine to replace placeholders in the SFDT.
 * @param sfdtString The raw SFDT template string.
 * @param data The data bindings object from the master JSON.
 * @returns A new SFDT string with placeholders replaced.
 */
function bindPlaceholders(sfdtString: string, data: any): string {
    let boundSfdt = sfdtString;
    // Regex to find all placeholders like {{object.property}} or <<object.property>>
    const placeholderRegex = /(?:\{\{|\<\<)([a-zA-Z0-9_.-]+)(?:\}\}|\>\>)/g;

    boundSfdt = boundSfdt.replace(placeholderRegex, (match, placeholder) => {
        const path = placeholder.split('.');
        let value: any = data;

        try {
            for (const key of path) {
                if (value === undefined || value === null) {
                    throw new Error(`Intermediate path is undefined for ${placeholder}`);
                }
                value = value[key];
            }
            // Ensure we don't return undefined or null
            return String(value ?? '');
        } catch (error) {
            console.warn(`Placeholder '{{${placeholder}}}' not found in data. Replacing with empty string.`);
            return ''; // Return empty string if path is invalid
        }
    });

    return boundSfdt;
}


/**
 * Populates tables within an SFDT document based on table definitions in the master JSON.
 * NOTE: This is a simplified simulation. A real implementation would need a much more
 * robust way to identify and manipulate tables within the SFDT structure.
 * @param sfdtObject The parsed SFDT JSON object.
 * @param tables The table definitions from the master JSON.
 */
function bindTables(sfdtObject: any, tables: { [key: string]: TableDefinition }): any {
    // This is a complex task. For this simulation, we'll log what we *would* do.
    console.log("Starting table binding process...");

    for (const tableName in tables) {
        const tableDef = tables[tableName];
        console.log(`Attempting to bind data for table: ${tableName} (ID: ${tableDef.sfdtTableId})`);

        // In a real implementation, you would:
        // 1. Traverse the sfdtObject.sections -> blocks to find a 'table' type block.
        // 2. You'd need a way to identify the table, perhaps by a custom property or by its content.
        //    The `sfdtTableId` is a conceptual hook for this.
        // 3. Once the table is found, you would:
        //    a. For 'repeatable' tables, find the last row, clone its structure, and insert new rows.
        //    b. For each new row, iterate through the `columns` in tableDef and map the `rowData`
        //       to the `cells` of the new row in the SFDT table block.
        //    c. For matrix tables like 'financials', you'd map `metrics` data to specific cell coordinates.
        // 4. Update the `sfdtObject` in place.
        
        console.log(`Simulated: Populated table '${tableName}' with ${tableDef.rows?.length || 0} rows.`);
    }
    
    console.log("Table binding process complete.");

    // Since this is a simulation, we return the object unmodified.
    return sfdtObject;
}

/**
 * Fetches the SFDT template and the master data, then binds them together.
 * This is the main service function to be called by the UI.
 * @param ratingNoteData The full master JSON schema for the rating note.
 * @returns The final, data-bound SFDT string ready for the editor.
 */
export async function getBoundRatingNoteSfdt(ratingNoteData: RatingNoteDataSchema): Promise<string> {
    
    // If the note already has saved content, use that instead of re-binding.
    if (ratingNoteData.editorContent && ratingNoteData.editorContent.length > 50) { // Basic check for non-empty content
        console.log("Loading existing editor content.");
        try {
            // Validate it's proper JSON before returning
            JSON.parse(ratingNoteData.editorContent);
            return ratingNoteData.editorContent;
        } catch (e) {
            console.error("Existing editor content is invalid, falling back to template binding.", e);
        }
    }
    
    console.log("No valid existing content found. Starting new data binding process.");

    // 1. Fetch and decompress the raw SFDT template from the path specified in the metadata.
    const sfdtTemplateString = await getSfdTemplateFromStorage(ratingNoteData.documentMeta.sfdtStoragePath);

    // 2. Perform placeholder data binding.
    // We bind data from both workflowContext and the main dataBindings object
    const combinedDataForBinding = { ...ratingNoteData.dataBindings, workflowContext: ratingNoteData.workflowContext };
    const placeholderBoundSfdtString = bindPlaceholders(sfdtTemplateString, combinedDataForBinding);
    
    // 3. Parse the SFDT for table manipulation.
    let sfdtObject = JSON.parse(placeholderBoundSfdtString);

    // 4. Perform table data binding.
    sfdtObject = bindTables(sfdtObject, ratingNoteData.tables);

    // 5. Stringify the final SFDT object to be sent to the editor.
    return JSON.stringify(sfdtObject);
}
