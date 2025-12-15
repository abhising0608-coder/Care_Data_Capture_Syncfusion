export const basicInfoSchema = {
  "title": "Basic Information",
  "description": "Enter the basic details for the operational data input.",
  "type": "object",
  "properties": {
    "cin": {
      "type": "string",
      "title": "Corporate Identification Number (CIN)"
    },
    "yearOfIncorporation": {
      "type": "number",
      "title": "Year of Incorporation"
    },
    "authorizedCapital": {
      "type": "number",
      "title": "Authorized Capital (in Crores)"
    },
    "paidUpCapital": {
      "type": "number",
      "title": "Paid-up Capital (in Crores)"
    }
  }
};
