#!/usr/bin/env node
/**
 * Template Diagnostic Tool - Advanced Template Testing
 * Use this to diagnose exactly what's wrong with your DOCX template
 */

const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

console.log('🔬 Advanced Template Diagnostic Tool');
console.log('===================================\n');

/**
 * Comprehensive template analysis
 */
function analyzeTemplate(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log(`🔍 Analyzing template: ${filePath}\n`);

  try {
    // Read file
    const buffer = fs.readFileSync(filePath);
    console.log(`✅ File size: ${buffer.length} bytes`);

    // Check ZIP signature
    const firstBytes = buffer.subarray(0, 4);
    const hasValidSignature = (firstBytes[0] === 0x50 && firstBytes[1] === 0x4B);
    console.log(`${hasValidSignature ? '✅' : '❌'} ZIP signature: ${hasValidSignature ? 'Valid' : 'Invalid'}`);
    
    if (!hasValidSignature) {
      console.log('   First 4 bytes:', Array.from(firstBytes).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '));
      console.log('   Expected: 0x50 0x4B (PK header)\n');
      return;
    }

    // Try to open as ZIP
    let zip;
    try {
      zip = new PizZip(buffer);
      console.log('✅ ZIP structure: Valid');
    } catch (zipError) {
      console.log('❌ ZIP structure: Failed to open');
      console.log('   Error:', zipError.message);
      return;
    }

    // Check required DOCX files
    const requiredFiles = [
      '[Content_Types].xml',
      'word/document.xml',
      '_rels/.rels',
      'word/_rels/document.xml.rels'
    ];

    console.log('\n📁 DOCX Structure Analysis:');
    requiredFiles.forEach(file => {
      const exists = !!zip.file(file);
      console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Present' : 'Missing'}`);
    });

    // Analyze document.xml content
    const documentFile = zip.file('word/document.xml');
    if (documentFile) {
      console.log('\n📄 Document Content Analysis:');
      try {
        const content = documentFile.asText();
        console.log(`✅ Document XML length: ${content.length} characters`);
        
        const hasDocumentTag = content.includes('<w:document');
        console.log(`${hasDocumentTag ? '✅' : '❌'} Has document tag: ${hasDocumentTag}`);
        
        const hasBodyTag = content.includes('<w:body');
        console.log(`${hasBodyTag ? '✅' : '❌'} Has body tag: ${hasBodyTag}`);
        
        // Look for placeholders
        const placeholderMatches = content.match(/{[^}]*}/g);
        if (placeholderMatches && placeholderMatches.length > 0) {
          console.log(`✅ Found ${placeholderMatches.length} template placeholders:`);
          placeholderMatches.forEach(placeholder => {
            console.log(`   - ${placeholder}`);
          });
        } else {
          console.log('⚠️  No template placeholders found (this may be normal)');
        }

        // Check for potential issues
        const hasInvalidChars = /[^\x20-\x7E\x09\x0A\x0D\u00A0-\uFFFF]/.test(content);
        console.log(`${hasInvalidChars ? '⚠️' : '✅'} Special characters: ${hasInvalidChars ? 'May cause issues' : 'Clean'}`);

      } catch (contentError) {
        console.log('❌ Failed to read document content:', contentError.message);
      }
    }

    // Try Docxtemplater initialization
    console.log('\n🔧 Docxtemplater Testing:');
    try {
      const doc = new Docxtemplater(zip, { 
        paragraphLoop: true, 
        linebreaks: true,
        nullGetter: function(part) {
          return '';
        }
      });
      console.log('✅ Docxtemplater initialization: Success');

      // Try getting full text
      try {
        const fullText = doc.getFullText();
        console.log(`✅ Template text extraction: ${fullText.length} characters`);
        
        // Show first 200 characters
        if (fullText.length > 0) {
          console.log('   Preview:', fullText.substring(0, 200) + (fullText.length > 200 ? '...' : ''));
        }
      } catch (textError) {
        console.log('⚠️  Template text extraction failed:', textError.message);
      }

      // Try rendering with dummy data
      try {
        const dummyData = {
          customer: { full_name: 'Test Customer', id_number: '123456789' },
          collateral: { description: 'Test Collateral', value: 1000000 },
          creditAssessment: { amount: 500000, term: 12 }
        };

        doc.render(dummyData);
        console.log('✅ Template rendering with dummy data: Success');

        // Try generating output
        const output = doc.getZip().generate({ type: 'nodebuffer' });
        console.log(`✅ Document generation: Success (${output.length} bytes)`);

      } catch (renderError) {
        console.log('❌ Template rendering failed:');
        console.log('   Error:', renderError.message);
        
        if (renderError.properties && renderError.properties.errors) {
          console.log('   Detailed errors:');
          renderError.properties.errors.forEach((err, index) => {
            console.log(`     ${index + 1}. ${err.message || 'Unknown error'}`);
            if (err.part) console.log(`        Location: ${err.part}`);
            if (err.explanation) console.log(`        Explanation: ${err.explanation}`);
          });
        }
      }

    } catch (docxtemplaterError) {
      console.log('❌ Docxtemplater initialization failed:');
      console.log('   Error:', docxtemplaterError.message);
    }

    console.log('\n📋 Summary & Recommendations:');
    
    if (!hasValidSignature) {
      console.log('❌ CRITICAL: File is not a valid DOCX (invalid ZIP signature)');
      console.log('   ➡️  Save the file as .docx format from Microsoft Word');
    } else if (!zip.file('[Content_Types].xml')) {
      console.log('❌ CRITICAL: Missing required DOCX structure');
      console.log('   ➡️  Create a new document in Word and save as .docx');
    } else if (!zip.file('word/document.xml')) {
      console.log('❌ CRITICAL: Missing document content');
      console.log('   ➡️  File appears corrupted, recreate from scratch');
    } else {
      console.log('✅ Template appears structurally sound');
      console.log('   ➡️  If still having issues, check the application logs for specific rendering errors');
    }

  } catch (error) {
    console.log('❌ Analysis failed:', error.message);
    console.log('   ➡️  File may be severely corrupted or not a valid DOCX file');
  }
}

// Usage instructions
console.log('📖 Usage Instructions:');
console.log('   1. Save your template file to this directory');
console.log('   2. Run: node template-diagnostic.js <filename>');
console.log('   3. Review the analysis results');
console.log('   4. Follow the recommendations to fix issues\n');

console.log('🧪 Example:');
console.log('   node template-diagnostic.js to_trinh_tham_dinh.docx\n');

// If filename provided, analyze it
const filename = process.argv[2];
if (filename) {
  analyzeTemplate(filename);
} else {
  console.log('⚠️  No filename provided. Please specify a DOCX file to analyze.');
  console.log('   Example: node template-diagnostic.js your-template.docx');
}
