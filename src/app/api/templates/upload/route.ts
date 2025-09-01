import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// POST /api/templates/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const templateName = formData.get('templateName') as string;
    const templateType = formData.get('templateType') as string;

    if (!file || !templateName || !templateType) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, templateName, templateType' 
      }, { status: 400 });
    }

    // Generate unique filename to avoid conflicts
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedName = templateName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedName}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob Storage in maubieu/ folder
    const { url } = await put(`maubieu/${filename}`, file, {
      access: 'public',
    });

    return NextResponse.json({ 
      fileUrl: url,
      filename,
      success: true 
    });
  } catch (error: any) {
    console.error('Template upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Template upload failed' 
    }, { status: 500 });
  }
}
