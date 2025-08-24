import { NextRequest, NextResponse } from 'next/server';
import { sendDocumentByEmailFromBlob } from '@/lib/documentService';

/**
 * Send document by email
 * POST /api/documents/sendmail
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, email } = body;

    // Validate required fields
    if (!fileName || !email) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileName, email' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Send document from Vercel Blob storage
    await sendDocumentByEmailFromBlob(fileName, email);
    
    return NextResponse.json({ 
      success: true, 
      message: `Document ${fileName} sent to ${email} successfully` 
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    }, { status: 500 });
  }
}
