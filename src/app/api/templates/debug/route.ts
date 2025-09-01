import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';

/**
 * GET /api/templates/debug - Debug template access and URL handling
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');
    
    if (!templateId) {
      return NextResponse.json({
        error: 'templateId parameter is required',
        usage: '/api/templates/debug?templateId=1'
      }, { status: 400 });
    }

    // Fetch template from database
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (error) {
      return NextResponse.json({
        error: 'Template not found',
        details: error.message,
        templateId
      }, { status: 404 });
    }

    // Test fetching the template file
    let fetchResult;
    try {
      console.log(`Testing template fetch for: ${template.file_url}`);
      const buffer = await fetchTemplateFromVercelBlob(template.file_url);
      
      fetchResult = {
        success: true,
        bufferSize: buffer.length,
        isValidZip: buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4B,
        first4Bytes: buffer.length >= 4 ? Array.from(buffer.subarray(0, 4)) : [],
      };
    } catch (fetchError) {
      fetchResult = {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      };
    }

    return NextResponse.json({
      template: {
        template_id: template.template_id,
        template_name: template.template_name,
        template_type: template.template_type,
        file_url: template.file_url,
        file_extension: template.file_extension,
        is_active: template.is_active,
        created_at: template.created_at
      },
      urlAnalysis: {
        isFullUrl: template.file_url.startsWith('https://'),
        isVercelBlob: template.file_url.includes('vercel-storage.com'),
        urlLength: template.file_url.length,
        urlPreview: template.file_url.length > 50 
          ? template.file_url.substring(0, 50) + '...' 
          : template.file_url
      },
      fetchTest: fetchResult,
      environment: {
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
        blobTokenPrefix: process.env.BLOB_READ_WRITE_TOKEN ? 
          process.env.BLOB_READ_WRITE_TOKEN.substring(0, 10) + '...' : 'not set',
        nodeEnv: process.env.NODE_ENV,
        runtime: process.env.VERCEL ? 'vercel' : 'local'
      }
    });

  } catch (error: any) {
    console.error('Template debug error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
