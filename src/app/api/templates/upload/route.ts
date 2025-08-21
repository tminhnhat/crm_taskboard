import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// POST /api/templates/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('template') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json({ error: 'Missing file or documentType' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const { url } = await put(`maubieu/${documentType}.docx`, file, {
      access: 'public',
    });

    return NextResponse.json({ url, success: true });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
