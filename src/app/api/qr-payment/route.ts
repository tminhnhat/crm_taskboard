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

    // Prepare QR data (using VietinBank format like toolqr.html)
    const qrData: VietQRData = {
      bankCode: '970415', // VietinBank code
      accountNumber: accountNumber.toString(),
      accountName: accountName.toString(),
      amount: amount ? parseFloat(amount) : undefined,
      description: description || '',
      template: 'QY3QZ1v' // Same template as toolqr.html
    };

    // VietinBank styling options (matching toolqr.html)
    const defaultOptions: QRImageOptions = {
      backgroundColor: '#bfe8ff',
      qrSize: 380,
      fontSize: {
        title: 40,
        header: 30,
        content: 24,
        small: 18
      },
      colors: {
        primary: '#134a7c',
        secondary: '#0b7cc2',
        text: '#134a7c',
        accent: '#355a78'
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
