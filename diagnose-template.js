const https = require('https');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function httpsRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ ok: true, data: data });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function diagnoseTemplate() {
    console.log('🔍 Testing template processing directly...');
    
    try {
        // Test the template processing API
        const response = await httpsRequest('https://crm.titi.io.vn/api/templates/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateName: 'bien_ban_dinh_gia' })
        });
        
        const result = JSON.parse(response.data);
        console.log('📋 Template test result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.log('❌ API test failed:', error.message);
    }
    
    // Let's try a simpler approach - just download the template file directly
    console.log('⬇️ Attempting to get template list...');
    
    try {
        const templatesResponse = await httpsRequest('https://crm.titi.io.vn/api/templates');
        const templates = JSON.parse(templatesResponse.data);
        console.log('📂 Available templates:', templates);
        
    } catch (error) {
        console.log('❌ Template list failed:', error.message);
    }
}

diagnoseTemplate();
