import { NextRequest, NextResponse } from 'next/server';
import { sendDocumentByEmailFromBlob } from '@/lib/documentService';

/**
 * Send document by email
 * POST /api/documents/actions - with action: 'sendEmail'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, fileName, email } = body;

    if (action === 'sendEmail') {
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

      const filePath = `${process.cwd()}/ketqua/${fileName}`;
      await sendDocumentByEmailFromBlob(fileName, email);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Document sent successfully' 
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action. Supported actions: sendEmail' 
    }, { status: 400 });

  } catch (error) {
    console.error('Document action error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Action failed' 
    }, { status: 500 });
  }
}
