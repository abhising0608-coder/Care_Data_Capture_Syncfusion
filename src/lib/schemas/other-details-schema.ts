export const otherDetailsSchema = {
  "title": "Other Details",
  "description": "Provide any other relevant information or details.",
  "type": "object",
  "properties": {
    "otherInfo": {
      "type": "array",
      "title": "Other Details",
      "items": {
        "type": "object",
        "properties": {
          "srNo": { "type": "number", "title": "Sr. No", "x-ui-readonly": true },
          "subject": { "type": "string", "title": "Subject" },
          "details": { "type": "string", "title": "Details" }
        }
      }
    }
  }
};
