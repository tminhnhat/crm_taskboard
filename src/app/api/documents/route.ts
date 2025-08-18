import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as XLSX from 'xlsx';
import nodemailer from 'nodemailer';

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
    const { templateType, data, email, downloadOnly } = await req.json();

    // Create ketqua directory if it doesn't exist
    const outputDir = join(process.cwd(), 'ketqua');
    await mkdir(outputDir, { recursive: true });

    let generatedFile;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (templateType === 'docx') {
      generatedFile = await generateDocx(data, timestamp);
    } else if (templateType === 'xlsx') {
      generatedFile = await generateXlsx(data, timestamp);
    } else {
      return NextResponse.json({ error: 'Unsupported template type' }, { status: 400 });
    }

    // Save file to ketqua folder
    const fileName = `${timestamp}-${templateType}.${templateType}`;
    const filePath = join(outputDir, fileName);
    await writeFile(filePath, generatedFile);

    // Upload to Vercel Blob for temporary storage
    const blob = await put(fileName, generatedFile, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Send email if requested
    if (email && !downloadOnly) {
      await sendEmail(email, blob.url, fileName);
      return NextResponse.json({ 
        message: 'File generated and sent via email',
        fileUrl: blob.url 
      });
    }

    // Return download URL
    return NextResponse.json({ 
      message: 'File generated successfully',
      fileUrl: blob.url 
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Error generating document' },
      { status: 500 }
    );
  }
}

async function generateDocx(data: any, timestamp: string) {
  // Get template from Vercel Blob
  const templateUrl = process.env.DOCX_TEMPLATE_URL;
  const templateResponse = await fetch(templateUrl as string);
  const templateBuffer = await templateResponse.arrayBuffer();

  // Create template instance
  const zip = new PizZip(templateBuffer);
  const doc = new Docxtemplater().loadZip(zip);

  // Render template with data
  doc.render(data);

  // Generate output
  return doc.getZip().generate({ type: 'nodebuffer' });
}

async function generateXlsx(data: any, timestamp: string) {
  // Get template from Vercel Blob
  const templateUrl = process.env.XLSX_TEMPLATE_URL;
  const templateResponse = await fetch(templateUrl as string);
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

async function sendEmail(to: string, fileUrl: string, fileName: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Generated Document',
    text: `Your document has been generated. You can download it here: ${fileUrl}`,
    attachments: [
      {
        filename: fileName,
        path: fileUrl
      }
    ]
  };

  await transporter.sendMail(mailOptions);
}
