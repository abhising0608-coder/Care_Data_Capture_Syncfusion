
import type { RatingNoteDataSchema, TableDefinition } from './definitions';

// In a real app, this would fetch from Firebase Storage based on the path in the JSON
async function getSfdTemplateFromStorage(path: string): Promise<string> {
    console.log(`Fetching template from simulated storage path: ${path}`);
    
    // This is a production-grade SFDT for Page 1 of the Rating Note.
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
                                        "blocks": [{ "inlines": [{ "text": "{{company.name}}", "characterFormat": { "bold": true } }] }],
                                        "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } }
                                    },
                                    {
                                        "blocks": [{ "inlines": [{ "text": "RCM Date: {{workflowContext.committeeDate}}", "characterFormat": { "bold": true } }], "paragraphFormat": { "textAlignment": "Right" } }],
                                        "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } }
                                    }
                                ]
                            }
                        ],
                        "tableFormat": { "borders": {} }
                    },
                    {
                        "inlines": [{ "text": "NOTE FOR RATING COMMITTEE", "characterFormat": { "bold": true } }],
                        "paragraphFormat": { "textAlignment": "Center" }
                    },
                    {
                        "type": "Table",
                        "rows": [{
                            "cells": [{
                                "blocks": [
                                    { "inlines": [{ "text": "Disclosure of Interest of Independent/Non-Executive Directors of CARE:" }] },
                                    { "inlines": [{ "text": "OR" }], "paragraphFormat": { "textAlignment": "Center" } },
                                    { "inlines": [{ "text": "Disclosure of Interest of Managing Director & CEO:" }] }
                                ],
                                "cellFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                            }]
                        }],
                        "tableFormat": { "borders": {} }
                    },
                    {
                        "inlines": [{ "text": "Rating of Bank facilities/Instruments of ₹{{rating.totalVolume}} crore*", "characterFormat": { "bold": true } }],
                        "paragraphFormat": { "textAlignment": "Center" }
                    },
                    {
                        "type": "Table",
                        "rows": [
                            {
                                "rowFormat": { "isHeader": true },
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Mandate ID", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle" } },
                                    { "blocks": [{ "inlines": [{ "text": "Facilities/Instruments", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle" } },
                                    { "blocks": [{ "inlines": [{ "text": "Volume (₹ crore)", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle" } },
                                    { "blocks": [{ "inlines": [{ "text": "Existing Rating", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle" } },
                                    { "blocks": [{ "inlines": [{ "text": "Agenda Type", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "verticalAlignment": "Middle" } }
                                ]
                            },
                            {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "{{workflowContext.mandateId}}" }] }] },
                                    { "blocks": [{ "inlines": [{ "text": " " }] }] },
                                    { "blocks": [{ "inlines": [{ "text": " " }] }] },
                                    { "blocks": [{ "inlines": [{ "text": " " }] }] },
                                    { "blocks": [{ "inlines": [{ "text": "Initial/Surveillance/Review/etc." }] }, { "inlines": [{ "text": "Withdrawn#" }] }] }
                                ]
                            }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                    },
                    { "inlines": [{ "text": "*# Details in Section 7.18", "characterFormat": { "fontSize": 8 } }] },
                    { "blocks": [] },
                    {
                        "type": "Table",
                        "rows": [
                            {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Date of last committee review", "characterFormat": { "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } },
                                    { "blocks": [{ "inlines": [{ "text": " " }] }] }
                                ]
                            },
                            {
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "text": "Review period", "characterFormat": { "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } },
                                    { "blocks": [{ "inlines": [{ "text": " " }] }] }
                                ]
                            }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } }, "preferredWidth": 50, "preferredWidthType": "Percentage" }
                    },
                    { "blocks": [] },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Analyst 1", "characterFormat": { "bold": true } }] }], "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } } }, { "blocks": [{ "inlines": [{ "text": "Analyst 2", "characterFormat": { "bold": true } }] }], "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } } }, { "blocks": [{ "inlines": [{ "text": "Group Head", "characterFormat": { "bold": true } }] }], "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } } }, { "blocks": [{ "inlines": [{ "text": "Rating Head", "characterFormat": { "bold": true } }] }], "cellFormat": { "borders": { "border": { "hasNoneStyle": true } } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "{{analyst.analyst1}}" }] }] }, { "blocks": [{ "inlines": [{ "text": "{{analyst.analyst2}}" }] }] }, { "blocks": [{ "inlines": [{ "text": "{{analyst.groupHead}}" }] }] }, { "blocks": [{ "inlines": [{ "text": "{{analyst.ratingHead}}" }] }] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                    },
                    {
                        "inlines": [{ "text": "Rating Recommendation:", "characterFormat": { "bold": true, "fontColor": "rgb(4, 53, 102)", "underline": "Single" } }]
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rating Team Recommendation", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" }, "columnSpan": 2 } }, { "blocks": [{ "inlines": [{ "text": "Long Term Rating and Outlook", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }, { "blocks": [{ "inlines": [{ "text": "Short Term Rating", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Ratings" }] }], "cellFormat": { "columnSpan": 2 } }, { "blocks": [{ "inlines": [{ "text": "{{rating.recommendedLongTerm}}" }] }] }, { "blocks": [{ "inlines": [{ "text": "{{rating.recommendedShortTerm}}" }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Unsupported Ratings if any" }] }], "cellFormat": { "columnSpan": 2 } }, { "blocks": [{ "inlines": [{ "text": "{{rating.unsupportedRatings}}" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rating in the absence of pending steps/documents" }] }], "cellFormat": { "columnSpan": 2 } }, { "blocks": [{ "inlines": [{ "text": "{{rating.absenceOfPendingDocs}}" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Rationale, in case the rating recommendation is different from final model rating output" }] }], "cellFormat": { "columnSpan": 2 } }, { "blocks": [{ "inlines": [{ "text": " " }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                    },
                    {
                        "inlines": [
                            { "text": "QC/Sector Specialist: " },
                            { "text": "<NAME>", "characterFormat": { "bold": true } },
                            { "text": " (" },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single" }, "navigationLink": "#qc-comments" },
                            { "text": " to view incorporated QC comments)" }
                        ]
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "QC Observations (only exceptions)", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }, { "blocks": [{ "inlines": [{ "text": "Reason for not accepting / not acting on the same", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": " " }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": " " }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                    },
                    {
                        "inlines": [
                            { "text": "CARE and other CRAs (" },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single" }, "navigationLink": "#cra-history" },
                            { "text": " for their history, sensitivities and key factors)" }
                        ]
                    },
                    {
                        "inlines": [
                            { "text": "Summary of hygiene checks: (" },
                            { "text": "Click here", "characterFormat": { "fontColor": "rgb(0, 0, 255)", "underline": "Single" }, "navigationLink": "#hygiene-checks" },
                            { "text": " for details)" }
                        ]
                    },
                    {
                        "type": "Table",
                        "rows": [
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Particulars", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }, { "blocks": [{ "inlines": [{ "text": "Yes/No/NA", "characterFormat": { "bold": true, "fontColor": "#ffffff" } }] }], "cellFormat": { "shading": { "backgroundColor": "rgb(4, 53, 102)" } } }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative observation on NDS" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative highlights in CIBIL / Watchout Investors" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative observation from Bank statements" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any negative highlight in client’s regulatory inspection declaration" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any adverse/negative qualification or observation in auditor report" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Is any of the debt listed?" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] },
                            { "cells": [{ "blocks": [{ "inlines": [{ "text": "Any historical default or settlement in the company/group?" }] }] }, { "blocks": [{ "inlines": [{ "text": " " }] }] }] }
                        ],
                        "tableFormat": { "borders": { "border": { "lineStyle": "Single", "lineWidth": 1 } } }
                    }
                ],
                "headersFooters": {
                    "footer": {
                        "blocks": [{
                            "type": "Table",
                            "rows": [{
                                "cells": [
                                    { "blocks": [{ "inlines": [{ "fieldType": "Page" }, { "text": " " }] }] },
                                    { "blocks": [{ "inlines": [{ "text": "Mfg. (General) Sector Version 1", "characterFormat": { "fontSize": 8 } }], "paragraphFormat": { "textAlignment": "Right" } }] }
                                ]
                            }],
                            "tableFormat": { "borders": { "top": { "lineStyle": "Single", "lineWidth": 1 } }, "cellSpacing": 0 }
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
    // Regex to find all placeholders like {{object.property}}
    const placeholderRegex = /\{\{([a-zA-Z0-9_.-]+)\}\}/g;

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
    const placeholderBoundSfdtString = bindPlaceholders(sfdtTemplateString, ratingNoteData.dataBindings);
    
    // 3. Parse the SFDT for table manipulation.
    let sfdtObject = JSON.parse(placeholderBoundSfdtString);

    // 4. Perform table data binding.
    sfdtObject = bindTables(sfdtObject, ratingNoteData.tables);

    // 5. Stringify the final SFDT object to be sent to the editor.
    return JSON.stringify(sfdtObject);
}
