export const companyDetailsSchema = {
    "title": "Company Details",
    "description": "Enter details about the company.",
    "type": "object",
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
};
