/* ================================================================
   SDC HR Solutions — Country Compliance Packs Configuration
   Provides localized tax rules, statutory benefits, and statutory rates.
   ================================================================ */

import { CompliancePack } from '../types';

export const COMPLIANCE_PACKS: Record<string, CompliancePack> = {
  PK: {
    country_code: "PK",
    country_name: "Pakistan",
    currency: "PKR",
    fiscal_year_start: "07-01", // July 1st
    tax_filing_format: "FBR-ADJUSTED-114(1)",
    statutory_contributions: [
      {
        name: "EOBI (Employees' Old-Age Benefits Institution)",
        employer_rate: 0.05, // 5% of minimum wage
        employee_rate: 0.01, // 1% of minimum wage
        ceiling: 32000,      // Max applicable salary for calculation (current Pak standard ceiling PKR 32,000)
        description: "Statutory pension contribution calculated on PKR 32,000 base."
      },
      {
        name: "Provident Fund",
        employer_rate: 0.0833, // 8.33% standard
        employee_rate: 0.0833,
        description: "Contributory retirement savings fund."
      },
      {
        name: "PESSI / SESSI (Social Security)",
        employer_rate: 0.06,
        employee_rate: 0,
        ceiling: 25000,
        description: "Employer-paid provincial social security healthcare levy."
      }
    ],
    leave_minimums: [
      { type: "Annual", days: 14 },
      { type: "Casual", days: 10 },
      { type: "Sick", days: 8 }
    ]
  },
  AE: {
    country_code: "AE",
    country_name: "United Arab Emirates",
    currency: "AED",
    fiscal_year_start: "01-01",
    tax_filing_format: "FTA-WPS-COMPLIANT-v2.1",
    statutory_contributions: [
      {
        name: "GPSSA Pension (For GCC Nationals)",
        employer_rate: 0.125, // 12.5%
        employee_rate: 0.05,  // 5%
        ceiling: 50000,
        description: "Pension for GCC citizens. Excludes foreign expatriates."
      },
      {
        name: "End-of-Service Gratuity Fund",
        employer_rate: 0.047, // Approx equivalent accrual rate (21 days/year)
        employee_rate: 0,
        description: "Accrued end-of-service reserve for expatriates."
      }
    ],
    leave_minimums: [
      { type: "Annual", days: 30 },
      { type: "Sick", days: 15 }
    ]
  },
  IN: {
    country_code: "IN",
    country_name: "India",
    currency: "INR",
    fiscal_year_start: "04-01", // April 1st
    tax_filing_format: "ITR-12-COMPLIANT",
    statutory_contributions: [
      {
        name: "EPF (Employees' Provident Fund)",
        employer_rate: 0.12, // 12%
        employee_rate: 0.12,
        ceiling: 15000,
        description: "Mandatory retirement savings for workers below ceiling."
      },
      {
        name: "ESI (Employee State Insurance)",
        employer_rate: 0.0325, // 3.25%
        employee_rate: 0.0075, // 0.75%
        ceiling: 21000,
        description: "State socialized medical benefits scheme."
      }
    ],
    leave_minimums: [
      { type: "Annual", days: 15 },
      { type: "Casual", days: 12 }
    ]
  },
  UK: {
    country_code: "UK",
    country_name: "United Kingdom",
    currency: "GBP",
    fiscal_year_start: "04-06", // April 6th
    tax_filing_format: "HMRC-RTI-PAYE",
    statutory_contributions: [
      {
        name: "National Insurance (Class 1)",
        employer_rate: 0.138, // 13.8%
        employee_rate: 0.08,  // 8% (Standard Category A)
        description: "National insurance funding healthcare and state pension."
      },
      {
        name: "Workplace Pension (Auto-Enrolment)",
        employer_rate: 0.03, // 3%
        employee_rate: 0.05,  // 5%
        description: "Statutory workplace private pension scheme."
      }
    ],
    leave_minimums: [
      { type: "Annual", days: 28 }
    ]
  }
};

/**
 * Returns a validated compliance pack for a country, defaulting to PK.
 */
export function getCompliancePack(countryCode: string): CompliancePack {
  return COMPLIANCE_PACKS[countryCode] || COMPLIANCE_PACKS.PK;
}
