import { NextRequest, NextResponse } from 'next/server';
import { generateCreditDocument, deleteDocument } from '@/lib/documentService';

// POST /api/documents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentType, customerId, collateralId, creditAssessmentId, exportType } = body;
    if (!documentType || !customerId || !exportType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await generateCreditDocument({
      documentType,
      customerId,
      collateralId,
      creditAssessmentId,
      exportType,
    });

    // Return file as download response
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.buffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('Document generation error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// GET /api/documents?file=filename
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: 'Missing file param' }, { status: 400 });
  }
  try {
    // Đọc file từ ketqua
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'ketqua', file);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const fileBuffer = fs.readFileSync(filePath);
    const ext = file.split('.').pop();
    let contentType = 'application/octet-stream';
    if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === 'pdf') contentType = 'application/pdf';
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/documents?file=filename
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: 'Missing file param' }, { status: 400 });
  }
  try {
    const ok = await deleteDocument(file);
    if (!ok) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
