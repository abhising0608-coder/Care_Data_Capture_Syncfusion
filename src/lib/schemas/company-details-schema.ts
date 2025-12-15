
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
          "din": { "type": "string", "title": "DIN" }
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
                "designation": { "type": "string", "title": "Designation" }
            }
        }
    },
    "entitiesConsolidated": {
        "type": "array",
        "title": "Annexure – List of Entities Consolidated",
        "items": {
            "type": "object",
            "properties": {
                "entityName": { "type": "string", "title": "Name of Entity" },
                "holdingPercentage": { "type": "number", "title": "% Holding" }
            }
        }
    }
  }
};
