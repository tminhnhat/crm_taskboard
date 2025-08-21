import { NextRequest, NextResponse } from 'next/server';
import { fetchTemplatesListFromVercelBlob, deleteTemplateFromVercelBlob } from '@/lib/vercelBlob';

// GET /api/templates - Lấy danh sách template
export async function GET() {
  try {
    const templates = await fetchTemplatesListFromVercelBlob('maubieu/');
    return NextResponse.json({ templates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}

// DELETE /api/templates?file=filename
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
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
