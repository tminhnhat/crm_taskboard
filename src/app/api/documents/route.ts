import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';
import { createClient } from 'redis';
import { 
  Template, 
  TemplateWithData, 
  DocxTemplateData, 
  XlsxTemplateData, 
  GeneratedFile 
} from '@/types/templates';

// Initialize Redis client
const client = createClient({ url: process.env.REDIS_URL });
let redis = client;

// Handle connection in an async function
async function getRedisClient() {
  if (!client.isOpen) {
    redis = await client.connect();
  }
  return redis;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Handle POST request
export async function POST(req: Request) {
  try {
    const { templates, data, email, downloadOnly } = await req.json();

    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: 'Templates must be an array' }, { status: 400 });
    }

    // Create ketqua directory if it doesn't exist
    const outputDir = join(process.cwd(), 'ketqua');
    await mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const generatedFiles = [];

    // Generate all documents
    for (const template of templates) {
      const { id, type, data: templateData } = template;
      
      // Get template metadata from Redis
      const redis = await getRedisClient();
      const templatesStr = await redis.get('document_templates');
      const allTemplates: Template[] = templatesStr ? JSON.parse(templatesStr) : [];
      const templateInfo = allTemplates.find(t => t.id === id);
      
      if (!templateInfo) {
        console.warn(`Template ${id} not found, skipping...`);
        continue;
      }

      let generatedFile;
      if (type === 'docx') {
        generatedFile = await generateDocx(templateInfo.url, templateData || data);
      } else if (type === 'xlsx') {
        generatedFile = await generateXlsx(templateInfo.url, templateData || data);
      } else {
        console.warn(`Unsupported template type: ${type}, skipping...`);
        continue;
      }

      // Save file to ketqua folder
      const fileName = `${timestamp}-${templateInfo.name}.${type}`;
      const filePath = join(outputDir, fileName);
      await writeFile(filePath, generatedFile);

      // Upload to Vercel Blob for temporary storage
      const blob = await put(fileName, generatedFile, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      generatedFiles.push({
        fileName,
        url: blob.url,
        type,
        templateName: templateInfo.name
      });
    }

    if (generatedFiles.length === 0) {
      return NextResponse.json({ error: 'No files were generated' }, { status: 400 });
    }

    // Send email if requested
    if (email && !downloadOnly) {
      await sendEmail(email, generatedFiles);
      return NextResponse.json({ 
        message: 'Files generated and sent via email',
        files: generatedFiles 
      });
    }

    // Return download URLs
    return NextResponse.json({ 
      message: 'Files generated successfully',
      files: generatedFiles 
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Error generating document' },
      { status: 500 }
    );
  }
}

async function generateDocx(templateUrl: string, data: DocxTemplateData): Promise<Buffer> {
  // Get template from Vercel Blob
  const templateResponse = await fetch(templateUrl);
  const templateBuffer = await templateResponse.arrayBuffer();

  // Create template instance
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater().loadZip(zip);

  // Render template with data
  doc.render(data);

  // Generate output
  return doc.getZip().generate({ type: 'nodebuffer' });
}

async function generateXlsx(templateUrl: string, data: XlsxTemplateData): Promise<Buffer> {
  // Get template from Vercel Blob
  const templateResponse = await fetch(templateUrl);
  const templateBuffer = await templateResponse.arrayBuffer();

  // Load template
  const workbook = XLSX.read(templateBuffer, { type: 'array' });

  // Process each sheet in the workbook
  Object.keys(data).forEach(sheetName => {
    if (workbook.Sheets[sheetName]) {
      const sheetData = data[sheetName];
      XLSX.utils.sheet_add_json(workbook.Sheets[sheetName], sheetData);
    }
  });

  // Generate output
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

async function sendEmail(to: string, files: Array<{ fileName: string; url: string; templateName: string }>) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Generated Documents',
    text: `Your documents have been generated. You can download them using the following links:\n\n${
      files.map(file => `${file.templateName}: ${file.url}`).join('\n')
    }`,
    attachments: files.map(file => ({
      filename: file.fileName,
      path: file.url
    }))
  };

  await transporter.sendMail(mailOptions);
}
