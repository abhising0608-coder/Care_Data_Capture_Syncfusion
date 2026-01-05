
import type { RatingNoteDataSchema, TableDefinition } from './definitions';

// In a real app, this would fetch from Firebase Storage based on the path in the JSON
async function getSfdTemplateFromStorage(path: string): Promise<string> {
    console.log(`Fetching template from simulated storage path: ${path}`);
    
    // This is a production-grade SFDT for Page 1 of the Rating Note.
    // It is pre-compiled to guarantee rendering fidelity.
    const page1Template = {
        "sections": [
            {
                "blocks": [
                    {
                        "type": "Table",
                        "rows": [
                            {
                                "cells": [
                                    {
                                        "blocks": [{ "inlines": [{ "text": "<<{{company.name}}>>", "characterFormat": { "bold": true, "fontSize": 12 } }] }],
                                        "cellFormat": { "borders": { "border": { "hasNoneStyle": true } }, "verticalAlignment": "Middle" }
                                    },
                                    {
                                        "blocks": [{ "inlines": [{ "text": "RCM Date: {{workflowContext.committeeDate}}", "characterFormat": { "fontSize": 11 } }], "paragraphFormat": { "textAlignment": "Right" } }],
                                        "cellFormat": { "borders": { "border": { "hasNoneStyle": true } }, "verticalAlignment": "Middle" }
                                    }
                                ],
                                "rowFormat": { "height": 30, "heightType": "AtLeast" }
                            }
                        ],
                        "tableFormat": { "borders": {}, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    {
                        "inlines": [{ "text": "NOTE FOR RATING COMMITTEE", "characterFormat": { "bold": true, "fontSize": 14 } }],
                        "paragraphFormat": { "textAlignment": "Center", "spaceAfter": 12 }
                    },
                    {
                        "type": "Table",
                        "rows": [{
                            "cells": [{
                                "blocks": [
                                    { "inlines": [{ "text": "Disclosure of Interest of Independent/Non-Executive Directors of CARE:", "characterFormat": { "fontSize": 11 } }], "paragraphFormat": { "spaceAfter": 6 } },
                                    { "inlines": [{ "text": "OR", "characterFormat": { "fontSize": 11 } }], "paragraphFormat": { "textAlignment": "Center", "spaceBefore": 6, "spaceAfter": 6 } },
                                    { "inlines": [{ "text": "Disclosure of Interest of Managing Director & CEO:", "characterFormat": { "fontSize": 11 } }], "paragraphFormat": { "spaceBefore": 6 } }
                                ],
                                "cellFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "padding": { "top": 5, "bottom": 5, "left": 5, "right": 5 } }
                            }]
                        }],
                        "tableFormat": { "borders": {}, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "paragraphFormat": { "spaceAfter": 6 } },
                    {
                        "inlines": [{ "text": "Rating of Bank facilities/Instruments of ₹{{rating.totalVolume}} crore*", "characterFormat": { "bold": true, "fontSize": 11 } }],
                        "paragraphFormat": { "textAlignment": "Center", "spaceAfter": 6 }
                    },
                    {
                        "type": "Table",
                        "rows": [
                            {
                                "rowFormat": { "isHeader": true },
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Mandate ID", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{ "inlines": [{ "text": "Facilities/Instruments", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{ "inlines": [{ "text": "Volume (₹ crore)", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{ "inlines": [{ "text": "Existing Rating", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{ "inlines": [{ "text": "Agenda Type", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }
                                ]
                            },
                            {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "{{workflowContext.mandateId}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} },
                                    { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} },
                                    { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} },
                                    { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} },
                                    { "blocks": [{ "inlines": [{ "text": "Initial/Surveillance/Review/etc.", "characterFormat": { "fontSize": 10 } }], "paragraphFormat": {"spaceAfter": 6} }, { "inlines": [{ "text": "Withdrawn#", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }
                                ]
                            }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "inlines": [{ "text": "*# Details in Section 7.18", "characterFormat": { "fontSize": 8 } }], "paragraphFormat": { "spaceAfter": 12 } },
                    {
                        "type": "Table",
                        "rows": [
                            {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Date of last committee review", "characterFormat": { "fontColor": "#ffffff", "fontSize": 10, "bold": true } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }
                                ]
                            },
                             {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Review period", "characterFormat": { "fontColor": "#ffffff", "fontSize": 10, "bold": true } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } },
                                    { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }
                                ]
                            }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "paragraphFormat": { "spaceAfter": 12 } },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Analyst 1", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Analyst 2", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Group Head", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Rating Head", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "{{analyst.analyst1}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{analyst.analyst2}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{analyst.groupHead}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{analyst.ratingHead}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "paragraphFormat": { "spaceAfter": 6 } },
                    {
                        "inlines": [{ "text": "Rating Recommendation:", "characterFormat": { "bold": true, "fontColor": "rgb(4, 53, 102)", "underline": "Single", "fontSize": 11 } }],
                        "paragraphFormat": { "spaceAfter": 6 }
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rating Team Recommendation", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Long Term Rating and Outlook", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Short Term Rating", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Ratings", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{rating.recommendedLongTerm}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{rating.recommendedShortTerm}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Unsupported Ratings if any", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{rating.unsupportedRatings}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rating in the absence of pending steps/documents", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{ "inlines": [{ "text": "{{rating.absenceOfPendingDocs}}", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rationale, in case the rating recommendation is different from final model rating output", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }, { "blocks": [{}] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "paragraphFormat": { "spaceAfter": 12 } },
                    {
                        "inlines": [
                            { "text": "QC/Sector Specialist: <NAME> (", "characterFormat": { "fontSize": 10 } },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single", "fontSize": 10 }, "navigationLink": "#qc-comments" },
                            { "text": " to view incorporated QC comments)", "characterFormat": { "fontSize": 10 } }
                        ], "paragraphFormat": { "spaceAfter": 6 }
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "QC Observations (only exceptions)", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Reason for not accepting / not acting on the same", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }] },
                            { "cells": [{ "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }, "rowSpan": 2 } }, { "blocks": [{}], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }, "rowSpan": 2} }] },
                            {}
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    },
                    { "paragraphFormat": { "spaceAfter": 12 } },
                     {
                        "inlines": [
                            { "text": "CARE and other CRAs (", "characterFormat": { "fontSize": 10 } },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single", "fontSize": 10 }, "navigationLink": "#cra-history" },
                            { "text": " for their history, sensitivities and key factors)", "characterFormat": { "fontSize": 10 } }
                        ], "paragraphFormat": { "spaceAfter": 6 }
                    },
                     {
                        "inlines": [
                            { "text": "Summary of hygiene checks: (", "characterFormat": { "fontSize": 10 } },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single", "fontSize": 10 }, "navigationLink": "#hygiene-checks" },
                            { "text": " for details)", "characterFormat": { "fontSize": 10 } }
                        ], "paragraphFormat": { "spaceAfter": 6 }
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Particulars", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }, { "blocks": [{ "inlines": [{ "text": "Yes/No/NA", "characterFormat": { "bold": true, "fontColor": "#ffffff", "fontSize": 10 } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle", "padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative observation on NDS", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative highlights in CIBIL / Watchout Investors", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative observation from Bank statements", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative highlight in client’s regulatory inspection declaration", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any adverse/negative qualification or observation in auditor report", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Is any of the debt listed?", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any historical default or settlement in the company/group?", "characterFormat": { "fontSize": 10 } }] }], "cellFormat": {"padding": { "top": 4, "bottom": 4, "left": 5, "right": 5 }} }, { "blocks": [{}] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0 }
                    }
                ],
                "headersFooters": {
                    "footer": {
                        "blocks": [{
                            "type": "Table",
                            "rows": [{
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "fieldType": "Page" }, { "text": " " }], "paragraphFormat": { "textAlignment": "Left" } }] },
                                    { "blocks": [{ "inlines": [{ "text": "Mfg. (General) Sector Version 1", "characterFormat": { "fontSize": 8 } }], "paragraphFormat": { "textAlignment": "Right" } }] }
                                ]
                            }],
                            "tableFormat": { "borders": { "top": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0, "leftIndent": 0, "preferredWidth": 100, "preferredWidthType": "Percentage" }
                        }]
                    }
                }
            }
        ]
    };
    return JSON.stringify(page1Template);
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

    // 1. Fetch the raw SFDT template from the path specified in the metadata.
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
