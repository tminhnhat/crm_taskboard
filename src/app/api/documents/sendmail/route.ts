import { NextRequest, NextResponse } from 'next/server';
import { sendDocumentByEmail, deleteDocument } from '@/lib/documentService';

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
