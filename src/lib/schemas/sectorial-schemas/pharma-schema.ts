export const pharmaSchema = {
  "title": "Pharma Sectorial Operational Data",
  "description": "Enter operational data specific to the Pharmaceutical sector.",
  "type": "object",
  "properties": {
    "manufacturingFacilities": {
      "type": "object",
      "title": "Manufacturing Facilities",
      "x-ui-variant": "spreadsheet-accordion",
      "properties": {
        "dataAvailability": {
          "type": "string",
          "title": "Data Availability",
          "enum": ["Available", "Not Available", "Not Applicable"],
          "default": "Not Applicable"
        },
        "spreadsheetData": {
            "type": "object",
            "title": "Spreadsheet Data",
            "properties": {
                // This will hold the JSON representation of the spreadsheet
            }
        }
      }
    },
    "geographyWiseSales": {
      "type": "object",
      "title": "Geography-wise Sales",
      "x-ui-variant": "spreadsheet-accordion",
      "properties": {
        "dataAvailability": {
          "type": "string",
          "title": "Data Availability",
          "enum": ["Available", "Not Available", "Not Applicable"],
          "default": "Not Applicable"
        },
        "spreadsheetData": {
            "type": "object",
            "title": "Spreadsheet Data"
        }
      }
    },
    "therapeuticSegmentWiseSales": {
        "type": "object",
        "title": "Therapeutic Segment-wise Sales",
        "x-ui-variant": "spreadsheet-accordion",
        "properties": {
          "dataAvailability": {
            "type": "string",
            "title": "Data Availability",
            "enum": ["Available", "Not Available", "Not Applicable"],
            "default": "Not Applicable"
          },
          "spreadsheetData": {
              "type": "object",
              "title": "Spreadsheet Data"
          }
        }
    },
     "brandWiseSales": {
        "type": "object",
        "title": "Brand-wise Sales",
        "x-ui-variant": "spreadsheet-accordion",
        "properties": {
          "dataAvailability": {
            "type": "string",
            "title": "Data Availability",
            "enum": ["Available", "Not Available", "Not Applicable"],
            "default": "Not Applicable"
          },
          "spreadsheetData": {
              "type": "object",
              "title": "Spreadsheet Data"
          }
        }
    }
  }
};
