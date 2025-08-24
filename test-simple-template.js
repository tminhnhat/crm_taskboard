const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

console.log('🧪 Testing simple template locally...');

try {
    // Load the simple template
    const buffer = fs.readFileSync('./simple-test-template.docx');
    console.log(`📁 Template loaded: ${buffer.length} bytes`);
    
    // Initialize ZIP
    const zip = new PizZip(buffer);
    console.log('✅ ZIP initialized successfully');
    
    // Initialize Docxtemplater
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: function(part, scopeManager) {
            console.log(`🔍 Missing variable: ${part.value}`);
            return "";
        }
    });
    console.log('✅ Docxtemplater initialized successfully');
    
    // Test data
    const testData = {
        customer_name: 'Test Customer Name',
        customer_id: '100',
        assessment_date: '2025-08-24',
        collateral_type: 'Real Estate',
        collateral_value: '1,000,000,000 VND'
    };
    
    console.log('🎨 Rendering template with test data...');
    doc.render(testData);
    console.log('✅ Template rendering successful!');
    
    // Generate output
    const output = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync('./simple-template-output.docx', output);
    console.log('💾 Output saved: simple-template-output.docx');
    
} catch (error) {
    console.log('❌ Local template test failed:', error.message);
    
    // Detailed error analysis
    if (error.properties) {
        console.log('🔍 Error details:');
        console.log('  - Name:', error.name);
        console.log('  - ID:', error.properties.id);
        console.log('  - Explanation:', error.properties.explanation);
        if (error.properties.errors) {
            console.log('🔍 Multi error details:');
            error.properties.errors.forEach((err, index) => {
                console.log(`  Error ${index + 1}:`, err.message);
                if (err.properties) {
                    console.log(`    - Tag: ${err.properties.tag || 'unknown'}`);
                    console.log(`    - Line: ${err.properties.line || 'unknown'}`);
                }
            });
        }
    }
}
