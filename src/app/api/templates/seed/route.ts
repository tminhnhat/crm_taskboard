import { NextRequest, NextResponse } from 'next/server';
import { seedBasicTemplates, ensureTemplatesExist } from '@/lib/templateSeeder';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'seed') {
      await seedBasicTemplates();
      return NextResponse.json({ 
        success: true, 
        message: 'Templates đã được tạo thành công' 
      });
    } else if (action === 'ensure') {
      await ensureTemplatesExist();
      return NextResponse.json({ 
        success: true, 
        message: 'Templates đã được kiểm tra và tạo nếu cần' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Action không hợp lệ' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error in template seeder API:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Lỗi không xác định' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { fetchTemplatesListFromVercelBlob } = await import('@/lib/vercelBlob');
    const templates = await fetchTemplatesListFromVercelBlob('maubieu/');
    
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
      templates: [],
      count: 0
    }, { status: 500 });
  }
}
