import { NextRequest, NextResponse } from 'next/server';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

/**
 * Template testing endpoint to help debug template issues
 * POST /api/templates/test - Test a specific template with dummy data
 */
export async function POST(req: NextRequest) {
  try {
    const { templateName } = await req.json();
    
    if (!templateName) {
      return NextResponse.json({ 
        error: 'Template name is required' 
      }, { status: 400 });
    }

    console.log(`Testing template: ${templateName}`);
    const startTime = Date.now();
    
    const testLog: string[] = [];
    const addLog = (message: string) => {
      console.log(message);
      testLog.push(`[${Date.now() - startTime}ms] ${message}`);
    };
    
    try {
      // Step 1: Fetch template
      addLog(`Fetching template: ${templateName}`);
      const templatePath = templateName.endsWith('.docx') ? `maubieu/${templateName}` : `maubieu/${templateName}.docx`;
      const templateBuffer = await fetchTemplateFromVercelBlob(templatePath);
      addLog(`Template fetched: ${templateBuffer.length} bytes`);
      
      // Step 2: Basic validation
      if (templateBuffer.length < 1000) {
        throw new Error('Template file is too small (likely corrupted)');
      }
      
      const firstBytes = new Uint8Array(templateBuffer.slice(0, 4));
      if (firstBytes[0] !== 0x50 || firstBytes[1] !== 0x4B) {
        throw new Error('Invalid ZIP signature - not a valid DOCX file');
      }
      addLog('Basic validation passed');
      
      // Step 3: Initialize ZIP
      addLog('Initializing ZIP reader...');
      const zip = new PizZip(templateBuffer);
      addLog('ZIP initialized successfully');
      
      // Step 4: Check required files
      const requiredFiles = ['[Content_Types].xml', 'word/document.xml', '_rels/.rels'];
      for (const file of requiredFiles) {
        if (!zip.file(file)) {
          throw new Error(`Missing required file: ${file}`);
        }
      }
      addLog('Required DOCX files present');
      
      // Step 5: Initialize Docxtemplater
      addLog('Initializing Docxtemplater...');
      const doc = new Docxtemplater(zip, { 
        paragraphLoop: true, 
        linebreaks: true,
        delimiters: {
          start: '{',
          end: '}'
        },
        nullGetter: function(part: any) {
          addLog(`Missing template variable: ${part.value || 'unknown'}`);
          return '';
        },
        errorLogging: true
      });
      addLog('Docxtemplater initialized successfully');
      
      // Step 6: Get template text
      let templateText = '';
      try {
        templateText = doc.getFullText();
        addLog(`Template text extracted: ${templateText.length} characters`);
      } catch (textError) {
        addLog(`Could not extract template text: ${textError}`);
      }
      
      // Step 7: Test rendering with dummy data
      addLog('Testing template rendering with dummy data...');
      const dummyData = {
        customer: {
          full_name: 'Test Customer Name',
          id_number: '123456789',
          phone: '0123456789',
          email: 'test@example.com',
          address: 'Test Address'
        },
        collateral: {
          description: 'Test Collateral Description',
          value: 1000000,
          type: 'Real Estate'
        },
        creditAssessment: {
          amount: 500000,
          term: 12,
          interest_rate: 8.5,
          assessment_result: 'Approved'
        }
      };
      
      try {
        doc.render(dummyData);
        addLog('Template rendering successful');
        
        // Step 8: Generate output
        const output = doc.getZip().generate({ 
          type: 'nodebuffer',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        addLog(`Document generated successfully: ${output.length} bytes`);
        
        return NextResponse.json({
          success: true,
          templateName,
          templatePath,
          templateSize: templateBuffer.length,
          outputSize: output.length,
          templateTextLength: templateText.length,
          testLog,
          message: 'Template test completed successfully'
        });
        
      } catch (renderError: any) {
        addLog(`Template rendering failed: ${renderError.message}`);
        
        // Detailed error analysis
        const errorDetails: any = {
          name: renderError.name,
          message: renderError.message,
          type: typeof renderError
        };
        
        if (renderError.properties && renderError.properties.errors) {
          errorDetails.docxtemplaterErrors = renderError.properties.errors.map((err: any) => ({
            message: err.message,
            part: err.part,
            explanation: err.explanation
          }));
          addLog(`Docxtemplater errors: ${errorDetails.docxtemplaterErrors.length} found`);
        }
        
        return NextResponse.json({
          success: false,
          templateName,
          error: 'Template rendering failed',
          errorDetails,
          testLog,
          recommendations: [
            'Check if template contains invalid syntax or characters',
            'Verify template placeholders use correct format: {variable_name}',
            'Try recreating the template from scratch in Microsoft Word',
            'Ensure template is saved as .docx format (not .doc)'
          ]
        });
      }
      
    } catch (error: any) {
      addLog(`Test failed: ${error.message}`);
      
      return NextResponse.json({
        success: false,
        templateName,
        error: error.message,
        testLog,
        recommendations: [
          'Check if template file exists in Vercel Blob storage',
          'Verify template is a valid DOCX file',
          'Try re-uploading the template',
          'Use the template diagnostic tool to analyze the file'
        ]
      });
    }
    
  } catch (error) {
    console.error('Template test error:', error);
    
    return NextResponse.json({
      error: 'Template test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
