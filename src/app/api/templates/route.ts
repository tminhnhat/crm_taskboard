import { NextRequest, NextResponse } from 'next/server';
import { deleteTemplateFromVercelBlob } from '@/lib/vercelBlob';
import { supabase } from '@/lib/supabase';

// GET /api/templates - Lấy danh sách template từ Supabase
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateType = searchParams.get('type');
    
    let query = supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (templateType) {
      query = query.eq('template_type', templateType);
    }
    
    const { data: templates, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ templates: templates || [] });
  } catch (err: any) {
    console.error('Error fetching templates:', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to fetch templates' 
    }, { status: 500 });
  }
}

// DELETE /api/templates?file=filename - Xóa template file từ Vercel Blob
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');
  
  if (!file) {
    return NextResponse.json({ error: 'Missing file param' }, { status: 400 });
  }
  
  try {
    await deleteTemplateFromVercelBlob(file);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting template file:', err);
    return NextResponse.json({ 
      error: err.message || 'Failed to delete template file' 
    }, { status: 500 });
  }
}
