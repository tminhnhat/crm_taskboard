import { NextRequest, NextResponse } from 'next/server';
import { fetchTemplateFromVercelBlob } from '@/lib/vercelBlob';
import PizZip from 'pizzip';

/**
 * Validates a DOCX template file for common corruption issues
 */
function validateDocxTemplate(buffer: Buffer): { isValid: boolean; error?: string; details?: any } {
  const details: any = {
    size: buffer.length,
    hasZipSignature: false,
    requiredFiles: {},
    xmlContent: {}
  };

  try {
    // Check minimum file size (empty DOCX is around 6KB)
    if (buffer.length < 1000) {
      return { 
        isValid: false, 
        error: 'Template file is too small (likely corrupted)', 
        details 
      };
    }

    // Check ZIP signature
    const firstBytes = buffer.subarray(0, 4);
    details.hasZipSignature = (firstBytes[0] === 0x50 && firstBytes[1] === 0x4B);
    
    if (!details.hasZipSignature) {
      return { 
        isValid: false, 
        error: 'Not a valid ZIP/DOCX file (invalid signature)', 
        details 
      };
    }

    // Try to read as ZIP
    try {
      const zip = new PizZip(buffer);
      
      // Check for required DOCX files
      const requiredFiles = [
        '[Content_Types].xml',
        'word/document.xml',
        '_rels/.rels'
      ];

      for (const file of requiredFiles) {
        const fileExists = !!zip.file(file);
        details.requiredFiles[file] = fileExists;
        
        if (!fileExists) {
          return { 
            isValid: false, 
            error: `Missing required file: ${file}`, 
            details 
          };
        }
      }

      // Try to read document.xml content
      const documentXml = zip.file('word/document.xml');
      if (documentXml) {
        const content = documentXml.asText();
        details.xmlContent.length = content?.length || 0;
        details.xmlContent.hasDocumentTag = content?.includes('<w:document') || false;
        details.xmlContent.hasClosingTag = content?.includes('</w:document>') || false;
        
        if (!content || content.length < 100) {
          return { 
            isValid: false, 
            error: 'Document content is empty or too small', 
            details 
          };
        }
        
        // Check for basic XML structure
        if (!content.includes('<w:document') || !content.includes('</w:document>')) {
          return { 
            isValid: false, 
            error: 'Invalid document XML structure', 
            details 
          };
        }
      }

      details.isValid = true;
      return { isValid: true, details };
    } catch (zipError) {
      return { 
        isValid: false, 
        error: `ZIP parsing failed: ${zipError instanceof Error ? zipError.message : 'Unknown ZIP error'}`, 
        details 
      };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      details 
    };
  }
}

// POST /api/templates/validate - Validate a specific template
export async function POST(req: NextRequest) {
  try {
    const { templateName } = await req.json();
    
    if (!templateName) {
      return NextResponse.json({ 
        error: 'Template name is required' 
      }, { status: 400 });
    }

    console.log(`Validating template: ${templateName}`);
    
    // Fetch template from Vercel Blob
    const templatePath = templateName.endsWith('.docx') ? `maubieu/${templateName}` : `maubieu/${templateName}.docx`;
    const templateBuffer = await fetchTemplateFromVercelBlob(templatePath);
    
    // Validate template
    const validation = validateDocxTemplate(templateBuffer);
    
    return NextResponse.json({
      templateName,
      templatePath,
      validation: {
        isValid: validation.isValid,
        error: validation.error,
        details: validation.details
      }
    });
    
  } catch (error) {
    console.error('Template validation error:', error);
    
    return NextResponse.json({
      error: 'Template validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/templates/validate - Get validation status of all templates
export async function GET() {
  try {
    // Get list of available templates
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/templates`);
    const templatesData = await response.json();
    
    if (!templatesData.templates) {
      return NextResponse.json({ 
        error: 'Could not fetch templates list' 
      }, { status: 500 });
    }

    const validationResults = [];
    
    // Validate each template
    for (const templateName of templatesData.templates) {
      try {
        const templateBuffer = await fetchTemplateFromVercelBlob(`maubieu/${templateName}`);
        const validation = validateDocxTemplate(templateBuffer);
        
        validationResults.push({
          templateName,
          ...validation
        });
      } catch (error) {
        validationResults.push({
          templateName,
          isValid: false,
          error: `Failed to fetch template: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    return NextResponse.json({
      totalTemplates: templatesData.templates.length,
      validTemplates: validationResults.filter(t => t.isValid).length,
      invalidTemplates: validationResults.filter(t => !t.isValid).length,
      results: validationResults
    });
    
  } catch (error) {
    console.error('Templates validation error:', error);
    
    return NextResponse.json({
      error: 'Templates validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
