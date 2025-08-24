// Simple template creator for testing
const PizZip = require('pizzip');
const fs = require('fs');

// Create a simple DOCX template with minimal content
function createSimpleTemplate() {
    console.log('📝 Creating simple test template...');
    
    // Minimal DOCX structure with a simple template variable
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
</Properties>`;

    const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
</cp:coreProperties>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>Customer Name: {customer_name}</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Customer ID: {customer_id}</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Assessment Date: {assessment_date}</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Collateral Type: {collateral_type}</w:t>
            </w:r>
        </w:p>
        <w:p>
            <w:r>
                <w:t>Collateral Value: {collateral_value}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`;

    // Create ZIP file
    const zip = new PizZip();
    
    zip.file('[Content_Types].xml', contentTypes);
    zip.file('docProps/app.xml', appXml);
    zip.file('docProps/core.xml', coreXml);
    zip.file('_rels/.rels', relsXml);
    zip.file('word/_rels/document.xml.rels', wordRelsXml);
    zip.file('word/document.xml', documentXml);
    
    const buffer = zip.generate({ type: 'nodebuffer' });
    fs.writeFileSync('./simple-test-template.docx', buffer);
    
    console.log('✅ Simple template created: simple-test-template.docx');
    console.log(`📁 Template size: ${buffer.length} bytes`);
    
    return buffer;
}

createSimpleTemplate();
