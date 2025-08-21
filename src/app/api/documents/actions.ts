import { NextRequest, NextResponse } from 'next/server';
import { sendDocumentByEmail, deleteDocument } from '@/lib/documentService';
import { deleteTemplateFromVercelBlob } from '@/lib/vercelBlob';

// POST /api/documents/sendmail
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, email } = body;
    if (!fileName || !email) {
      return NextResponse.json({ error: 'Missing fileName or email' }, { status: 400 });
    }
    const filePath = `${process.cwd()}/ketqua/${fileName}`;
    await sendDocumentByEmail(filePath, email);
    return NextResponse.json({ success: true });
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

// DELETE /api/templates?file=maubieu/filename
export async function DELETE_TEMPLATE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: 'Missing file param' }, { status: 400 });
  }
  try {
    await deleteTemplateFromVercelBlob(file);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
