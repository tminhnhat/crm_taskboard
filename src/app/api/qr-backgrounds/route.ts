import { NextRequest, NextResponse } from 'next/server';
import { getQRBackgroundImages } from '@/lib/vietqr';

export async function GET(request: NextRequest) {
  try {
    const backgrounds = await getQRBackgroundImages();
    
    return NextResponse.json({
      success: true,
      backgrounds: backgrounds
    });
  } catch (error) {
    console.error('Error fetching QR backgrounds:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch QR background images',
        backgrounds: []
      },
      { status: 500 }
    );
  }
}
