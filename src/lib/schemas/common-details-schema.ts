
export const commonDetailsSchema = {
  "title": "Common Details",
  "description": "Enter common financial and risk details.",
  "type": "object",
  "properties": {
    "benchmarkInterestRates": {
      "type": "object",
      "title": "Benchmark Interest Rates",
      "x-ui-variant": "accordion",
      "properties": {
        "dataAvailability": {
          "type": "string",
          "title": "Data Availability",
          "enum": ["Available", "Not Available", "Not Applicable"],
          "default": "Not Applicable"
        },
        "tableData": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "year": { "type": "string", "title": "Year" },
              "mclr": { "type": "number", "title": "MCLR (%)" },
              "baseRate": { "type": "number", "title": "Base Rate (%)" }
            }
          }
        }
      }
    },
    "limitUtilization": {
      "type": "object",
      "title": "Limit Utilization (Fund-Based)",
      "x-ui-variant": "accordion",
      "properties": {
        "dataAvailability": {
          "type": "string",
          "title": "Data Availability",
          "enum": ["Available", "Not Available", "Not Applicable"],
          "default": "Not Applicable"
        },
        "tableData": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "month": { "type": "string", "title": "Month" },
              "sanctionedLimit": { "type": "number", "title": "Sanctioned Limit" },
              "avgUtilization": { "type": "number", "title": "Avg. Utilization" },
              "peakUtilization": { "type": "number", "title": "Peak Utilization" },
              "utilizationPercentage": { "type": "number", "title": "Utilization (%)", "x-ui-readonly": true, "x-ui-formula": "({avgUtilization} / {sanctionedLimit}) * 100" }
            }
          }
        }
      }
    },
    "fundBasedRiskAnalysis": {
        "type": "object",
        "title": "Fund-Based Limit Risk Analysis",
        "x-ui-variant": "accordion",
        "properties": {
          "dataAvailability": {
            "type": "string",
            "title": "Data Availability",
            "enum": ["Available", "Not Available", "Not Applicable"],
            "default": "Not Applicable"
          },
          "tableData": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "riskParameter": { "type": "string", "title": "Risk Parameter" },
                "score": { "type": "number", "title": "Score" },
                "risk": { "type": "string", "title": "Risk" }
              }
            }
          }
        }
    },
    "nonFundBasedRiskAnalysis": {
        "type": "object",
        "title": "Non-Fund Based Limit Risk Analysis",
        "x-ui-variant": "accordion",
        "properties": {
            "dataAvailability": {
            "type": "string",
            "title": "Data Availability",
            "enum": ["Available", "Not Available", "Not Applicable"],
            "default": "Not Applicable"
            },
            "tableData": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "riskParameter": { "type": "string", "title": "Risk Parameter" },
                    "score": { "type": "number", "title": "Score" },
                    "risk": { "type": "string", "title": "Risk" }
                }
            }
          }
        }
    }
  }
};
