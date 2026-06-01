// ─── Letter Engine Types ───

export interface LetterTemplate {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: 'offer' | 'appointment' | 'confirmation' | 'promotion' | 'transfer' | 'warning' | 'termination' | 'experience' | 'salary_revision' | 'custom';
  subject: string;
  body: string; // Handlebars template with {{variables}}
  variables: LetterVariable[];
  headerHtml?: string;
  footerHtml?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LetterVariable {
  key: string;
  label: string;
  source: 'employee' | 'company' | 'custom';
  defaultValue?: string;
}

export interface GeneratedLetter {
  id: string;
  tenantId: string;
  templateId: string;
  templateName?: string;
  employeeId: string;
  employeeName?: string;
  subject: string;
  body: string;
  pdfUrl?: string;
  generatedById: string;
  generatedByName?: string;
  createdAt: string;
}

export interface GenerateLetterDto {
  templateId: string;
  employeeId: string;
  customValues?: Record<string, string>;
}
