// Template types
export interface DocxTemplateData {
  [key: string]: string | number | boolean | Date | DocxTemplateData;
}

export interface XlsxTemplateData {
  [sheet: string]: Array<{
    [key: string]: string | number | boolean | Date;
  }>;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  type: 'docx' | 'xlsx';
  url: string;
  fileName: string;
  createdAt: string;
}

export interface GeneratedFile {
  fileName: string;
  url: string;
  type: string;
  templateName: string;
}

export interface TemplateWithData {
  id: string;
  type: 'docx' | 'xlsx';
  data?: DocxTemplateData | XlsxTemplateData;
}
