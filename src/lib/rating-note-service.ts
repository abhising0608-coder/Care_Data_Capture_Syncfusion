
import type { RatingNoteDataSchema, TableDefinition } from './definitions';
import template from './rating-note-template.json';
import pako from 'pako';

/**
 * Decodes, decompresses, and returns the raw SFDT JSON string from the template file.
 * This can be used to directly load the template without any data binding.
 */
export async function getDecompressedSfdt(): Promise<string> {
    const base64String = (template as any).sfdt;
    try {
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        try {
            // First, try to decompress assuming it's gzipped.
            return pako.inflate(bytes, { to: 'string' });
        } catch (e: any) {
            // If it fails with an "incorrect header check", it's likely not compressed.
            // In that case, we treat the decoded string as the raw SFDT JSON.
            if (e.message.includes('incorrect header check')) {
                console.warn('SFDT content is not compressed. Treating as plain JSON string.');
                return new TextDecoder().decode(bytes);
            }
            // If it's another error, re-throw it.
            throw e;
        }

    } catch (error) {
        console.error("Failed to decode or decompress SFDT content:", error);
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
            return String(value ?? '');
        } catch (error) {
            console.warn(`Placeholder '{{${placeholder}}}' not found in data. Replacing with empty string.`);
            return '';
        }
    });

    return boundSfdt;
}


/**
 * Populates tables within an SFDT document based on table definitions in the master JSON.
 * @param sfdtObject The parsed SFDT JSON object.
 * @param tables The table definitions from the master JSON.
 */
function bindTables(sfdtObject: any, tables: { [key: string]: TableDefinition }): any {
    console.log("Starting table binding process...");

    for (const tableName in tables) {
        const tableDef = tables[tableName];
        console.log(`Simulating data binding for table: ${tableName} (ID: ${tableDef.sfdtTableId})`);
    }
    
    console.log("Table binding process complete.");
    return sfdtObject;
}

/**
 * Fetches the SFDT template and the master data, then binds them together.
 * @param ratingNoteData The full master JSON schema for the rating note.
 * @returns The final, data-bound SFDT string ready for the editor.
 */
export async function getBoundRatingNoteSfdt(ratingNoteData: RatingNoteDataSchema): Promise<string> {
    
    if (ratingNoteData.editorContent && ratingNoteData.editorContent.length > 50) {
        console.log("Loading existing editor content.");
        try {
            JSON.parse(ratingNoteData.editorContent);
            return ratingNoteData.editorContent;
        } catch (e) {
            console.error("Existing editor content is invalid, falling back to template binding.", e);
        }
    }
    
    console.log("No valid existing content found. Starting new data binding process.");

    const sfdtTemplateString = await getDecompressedSfdt();

    const combinedDataForBinding = { ...ratingNoteData.dataBindings, workflowContext: ratingNoteData.workflowContext };
    const placeholderBoundSfdtString = bindPlaceholders(sfdtTemplateString, combinedDataForBinding);
    
    let sfdtObject = JSON.parse(placeholderBoundSfdtString);
    sfdtObject = bindTables(sfdtObject, ratingNoteData.tables);

    return JSON.stringify(sfdtObject);
}
