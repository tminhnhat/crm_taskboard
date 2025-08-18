import { NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { kv } from '@vercel/kv';
import { Template } from '@/types/templates';

export async function GET() {
  try {
    // Get templates metadata from KV store
    const templates = await kv.get<Template[]>('document_templates') || [];
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Error fetching templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;

    if (!file || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload template to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Save template metadata to KV store
    const template = {
      id: Date.now().toString(),
      name,
      description,
      type,
      url: blob.url,
      fileName: file.name,
      createdAt: new Date().toISOString()
    };

    const templates = await kv.get<Template[]>('document_templates') || [];
    templates.push(template as Template);
    await kv.set('document_templates', templates);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error uploading template:', error);
    return NextResponse.json(
      { error: 'Error uploading template' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const templates = await kv.get<Template[]>('document_templates') || [];
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = templates[templateIndex];
    
    // Delete from Vercel Blob
    await del(template.url);
    
    // Remove from KV store
    templates.splice(templateIndex, 1);
    await kv.set('document_templates', templates);

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Error deleting template' },
      { status: 500 }
    );
  }
}
