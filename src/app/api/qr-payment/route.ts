import { NextRequest, NextResponse } from 'next/server';
import { createPaymentQRImage, VietQRData, QRImageOptions } from '@/lib/vietqr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      accountNumber,
      accountName,
      amount,
      description,
      customOptions
    } = body;

    // Validate required fields
    if (!accountNumber || !accountName) {
      return NextResponse.json(
        { error: 'Số tài khoản và tên chủ tài khoản là bắt buộc' },
        { status: 400 }
      );
    }

    // Prepare QR data
    const qrData: VietQRData = {
      bankCode: 'VTB', // Vietinbank
      accountNumber: accountNumber.toString(),
      accountName: accountName.toString(),
      amount: amount ? parseFloat(amount) : undefined,
      description: description || '',
      template: 'compact2'
    };

    // Default options for A6 size
    const defaultOptions: QRImageOptions = {
      backgroundColor: '#ffffff',
      qrSize: 400,
      fontSize: {
        title: 48,
        header: 36,
        content: 32,
        small: 24
      },
      colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        text: '#1F2937',
        accent: '#059669'
      }
    };

    const options = { ...defaultOptions, ...customOptions };

    // Generate QR image
    const imageBuffer = await createPaymentQRImage(qrData, options);

    // Return image as response
    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-payment-${accountNumber}.png"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo mã QR thanh toán' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const accountNumber = searchParams.get('accountNumber');
  const accountName = searchParams.get('accountName');
  const amount = searchParams.get('amount');
  const description = searchParams.get('description');

  if (!accountNumber || !accountName) {
    return NextResponse.json(
      { error: 'Số tài khoản và tên chủ tài khoản là bắt buộc' },
      { status: 400 }
    );
  }

  try {
    const qrData: VietQRData = {
      bankCode: 'VTB',
      accountNumber: accountNumber,
      accountName: accountName,
      amount: amount ? parseFloat(amount) : undefined,
      description: description || '',
    };

    const imageBuffer = await createPaymentQRImage(qrData);

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="qr-payment-${accountNumber}.png"`,
      },
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo mã QR thanh toán' },
      { status: 500 }
    );
  }
}
