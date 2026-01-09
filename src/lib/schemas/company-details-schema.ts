
export const companyDetailsSchema = {
  "title": "Company Details",
  "description": "Enter details about the company, its directors, and management.",
  "type": "object",
  "properties": {
    "basicDetails": {
      "type": "object",
      "title": "Basic Details",
      "properties": {
        "registeredOffice": {
          "type": "string",
          "title": "Registered Office Address"
        },
        "corporateOffice": {
          "type": "string",
          "title": "Corporate Office Address"
        },
        "telephone": {
          "type": "string",
          "title": "Telephone No."
        },
        "fax": {
          "type": "string",
          "title": "Fax No."
        },
        "email": {
          "type": "string",
          "title": "Email Address",
          "format": "email"
        },
        "website": {
          "type": "string",
          "title": "Website",
          "format": "uri"
        }
      }
    },
    "boardOfDirectors": {
      "type": "array",
      "title": "Board of Directors",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "title": "Name" },
          "designation": { "type": "string", "title": "Designation" },
          "yearsOfExperience": { "type": "number", "title": "Years of Exp." },
          "directorshipsHeld": { "type": "number", "title": "Directorships" },
          "directorType": { 
            "type": "string", 
            "title": "Type",
            "enum": ["Executive", "Non-Executive", "Promoter"]
          },
          "functionsLookedAfter": { "type": "string", "title": "Functions" },
          "age": { "type": "number", "title": "Age" },
          "qualification": { "type": "string", "title": "Qualification" }
        }
      }
    },
    "seniorManagement": {
        "type": "array",
        "title": "Senior Management / Key Management Personnel",
        "items": {
            "type": "object",
            "properties": {
                "name": { "type": "string", "title": "Name" },
                "designation": { "type": "string", "title": "Designation" },
                "yearsOfExperience": { "type": "number", "title": "Years of Exp" },
                "briefProfile": { "type": "string", "title": "Brief Profile" },
                "age": { "type": "number", "title": "Age" },
                "qualification": { "type": "string", "title": "Qualification" }
            }
        }
    },
    "entitiesConsolidated": {
        "type": "array",
        "title": "Annexure – List of Entities Consolidated",
        "items": {
            "type": "object",
            "properties": {
                "srNo": { "type": "string", "title": "Sr. No" },
                "entityName": { "type": "string", "title": "Name of the Company" },
                "extentOfConsolidation": { 
                    "type": "string", 
                    "title": "Extent of Consolidation",
                    "enum": ["Full Consolidation", "Moderate Consolidation", "Proportionate Consolidation", "Other"]
                },
                "rationaleForConsolidation": { "type": "string", "title": "Rationale for Consolidation" }
            }
        }
    }
  }
};
