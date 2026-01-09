
import { companyDetailsSchema } from '../company-details-schema';
import { commonDetailsSchema } from '../common-details-schema';
import { otherDetailsSchema } from '../other-details-schema';
import { basicInfoSchema } from '../basic-info-schema';


export const pharmaSchema = {
  "title": "Pharma Sectorial Operational Data",
  "description": "Enter operational data specific to the Pharmaceutical sector.",
  "type": "object",
  "properties": {
    "basicInfo": {
      "title": "Basic Info",
      ...basicInfoSchema
    },
    "companyDetails": {
      "title": "Company Details",
      ...companyDetailsSchema
    },
    "commonDetails": {
      "title": "Common Details",
       ...commonDetailsSchema
    },
    "sectorialOperationalData": {
        "type": "object",
        "title": "Sectorial Operational Data",
        "x-ui-variant": "accordion",
        "properties": {
            "manufacturingFacilities": {
                "type": "object",
                "title": "Manufacturing Facilities",
                "x-ui-variant": "spreadsheet",
                "x-ui-spreadsheet-type": "simple-table",
                "properties": {
                    "dataAvailability": { "type": "string", "title": "Data Availability", "enum": ["Available", "Not Available", "Not Applicable"], "default": "Not Applicable" },
                    "versions": { "type": "array", "items": { "type": "object", "properties": { "version": { "type": "number" }, "timestamp": { "type": "string" }, "data": { "type": "array" } } } },
                    "activeVersion": { "type": "number" }
                }
            },
            "geographyWiseSales": {
                "type": "object",
                "title": "Geography-wise Sales",
                "x-ui-variant": "spreadsheet",
                "x-ui-spreadsheet-type": "geography-sales",
                "properties": {
                    "dataAvailability": { "type": "string", "title": "Data Availability", "enum": ["Available", "Not Available", "Not Applicable"], "default": "Not Applicable" },
                    "versions": { "type": "array", "items": { "type": "object", "properties": { "version": { "type": "number" }, "timestamp": { "type": "string" }, "data": { "type": "array" } } } },
                    "activeVersion": { "type": "number" }
                }
            },
            "therapeuticSegmentWiseSales": {
                "type": "object",
                "title": "Therapeutic Segment-wise Sales",
                "x-ui-variant": "spreadsheet",
                "properties": {
                    "dataAvailability": { "type": "string", "title": "Data Availability", "enum": ["Available", "Not Available", "Not Applicable"], "default": "Not Applicable" },
                    "spreadsheetData": { "type": "object", "title": "Spreadsheet Data" }
                }
            },
            "brandWiseSales": {
                "type": "object",
                "title": "Brand-wise Sales",
                "x-ui-variant": "spreadsheet",
                "properties": {
                    "dataAvailability": { "type": "string", "title": "Data Availability", "enum": ["Available", "Not Available", "Not Applicable"], "default": "Not Applicable" },
                    "spreadsheetData": { "type": "object", "title": "Spreadsheet Data" }
                }
            }
        }
    },
    "otherDetails": {
      "title": "Other Details",
      ...otherDetailsSchema
    }
  }
};
