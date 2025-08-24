// Upload simple template to production to replace the broken one
const fs = require('fs');
const https = require('https');

async function uploadSimpleTemplate() {
    console.log('📤 Uploading simple working template to production...');
    
    try {
        // Read our simple template
        const templateBuffer = fs.readFileSync('./simple-test-template.docx');
        console.log(`📁 Template size: ${templateBuffer.length} bytes`);
        
        // Convert to base64 for upload
        const base64Template = templateBuffer.toString('base64');
        
        const uploadData = JSON.stringify({
            templateName: 'simple_test_template',
            file: base64Template,
            fileName: 'simple_test_template.docx'
        });
        
        console.log('🔄 Sending to production...');
        
        // Upload to production
        const response = await new Promise((resolve, reject) => {
            const req = https.request('https://crm.titi.io.vn/api/templates/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(uploadData)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ statusCode: res.statusCode, data: data });
                });
            });
            req.on('error', reject);
            req.write(uploadData);
            req.end();
        });
        
        console.log(`📋 Upload response (${response.statusCode}):`, response.data);
        
        if (response.statusCode === 200) {
            console.log('✅ Template uploaded successfully!');
            
            // Test the new template
            console.log('🧪 Testing uploaded template...');
            const testResponse = await new Promise((resolve, reject) => {
                const testData = JSON.stringify({ templateName: 'simple_test_template' });
                const req = https.request('https://crm.titi.io.vn/api/templates/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(testData)
                    }
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({ statusCode: res.statusCode, data: data });
                    });
                });
                req.on('error', reject);
                req.write(testData);
                req.end();
            });
            
            const testResult = JSON.parse(testResponse.data);
            console.log('🧪 Test result:', JSON.stringify(testResult, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Upload failed:', error.message);
    }
}

uploadSimpleTemplate();
