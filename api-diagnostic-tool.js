#!/usr/bin/env node
/**
 * API Document Generation Diagnostic Tool
 * Tests the /api/documents endpoint to identify 400 errors
 */

const https = require('https');

console.log('🔍 Document Generation API Diagnostic Tool');
console.log('==========================================\n');

const API_BASE = 'https://crm.titi.io.vn';
const API_ENDPOINT = '/api/documents?return=json';

console.log(`Testing API: ${API_BASE}${API_ENDPOINT}\n`);

// Test cases that might cause 400 errors
const testCases = [
  {
    name: 'Missing documentType',
    data: {
      customerId: '1',
      exportType: 'docx'
    },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Missing customerId', 
    data: {
      documentType: 'to_trinh_tham_dinh',
      exportType: 'docx'
    },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Missing exportType',
    data: {
      documentType: 'to_trinh_tham_dinh',
      customerId: '1'
    },
    expectedError: 'Missing required fields'
  },
  {
    name: 'Invalid documentType',
    data: {
      documentType: 'invalid_document_type',
      customerId: '1',
      exportType: 'docx'
    },
    expectedError: 'Invalid document type'
  },
  {
    name: 'Invalid exportType',
    data: {
      documentType: 'to_trinh_tham_dinh',
      customerId: '1',
      exportType: 'pdf'
    },
    expectedError: 'Invalid export type'
  },
  {
    name: 'Valid request (should work)',
    data: {
      documentType: 'to_trinh_tham_dinh',
      customerId: '1',
      collateralId: '1',
      creditAssessmentId: '1',
      exportType: 'docx'
    },
    expectedError: null
  },
  {
    name: 'Excel export (should work)',
    data: {
      documentType: 'bang_tinh_lai',
      customerId: '1',
      exportType: 'xlsx'
    },
    expectedError: null
  }
];

async function testAPI(testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.data);
    
    const options = {
      hostname: 'crm.titi.io.vn',
      port: 443,
      path: API_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'API-Diagnostic-Tool/1.0'
      }
    };

    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`   Request: ${JSON.stringify(testCase.data)}`);

    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        try {
          const jsonResponse = JSON.parse(responseBody);
          console.log(`   Response: ${JSON.stringify(jsonResponse, null, 2)}`);
        } catch (e) {
          console.log(`   Response (raw): ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);
        }
        
        if (res.statusCode === 400) {
          console.log(`   ✅ Expected 400 error: ${testCase.expectedError || 'Any error'}`);
        } else if (res.statusCode === 200) {
          console.log(`   ✅ Success: Request processed successfully`);
        } else {
          console.log(`   ❌ Unexpected status: ${res.statusCode}`);
        }
        
        console.log('');
        resolve({ status: res.statusCode, body: responseBody });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      console.log('');
      resolve({ error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runDiagnostics() {
  console.log('🚀 Starting API diagnostics...\n');
  
  for (const testCase of testCases) {
    await testCase;
    // Add delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📋 Diagnostic Summary:');
  console.log('====================\n');
  
  console.log('✅ Common 400 Error Causes:');
  console.log('   1. Missing required fields: documentType, customerId, exportType');
  console.log('   2. Invalid documentType (must be one of the predefined types)');
  console.log('   3. Invalid exportType (must be "docx" or "xlsx")');
  console.log('   4. Malformed JSON in request body');
  console.log('   5. Missing Content-Type header\n');
  
  console.log('🔧 Valid Document Types:');
  console.log('   • hop_dong_tin_dung (Hợp đồng tín dụng)');
  console.log('   • to_trinh_tham_dinh (Tờ trình thẩm định)');
  console.log('   • giay_de_nghi_vay_von (Giấy đề nghị vay vốn)');
  console.log('   • bien_ban_dinh_gia (Biên bản định giá)');
  console.log('   • hop_dong_the_chap (Hợp đồng thế chấp)');
  console.log('   • bang_tinh_lai (Bảng tính lãi)');
  console.log('   • lich_tra_no (Lịch trả nợ)\n');
  
  console.log('📝 Valid Export Types:');
  console.log('   • docx (Word document)');
  console.log('   • xlsx (Excel spreadsheet)\n');
  
  console.log('💡 Example Valid Request:');
  console.log(`
curl -X POST "${API_BASE}${API_ENDPOINT}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "collateralId": "1",
    "creditAssessmentId": "1",  
    "exportType": "docx"
  }'
  `);
  
  console.log('🔍 Debugging Steps:');
  console.log('   1. Check all required fields are present');
  console.log('   2. Verify documentType matches valid options');
  console.log('   3. Confirm exportType is "docx" or "xlsx"');
  console.log('   4. Ensure JSON is properly formatted');
  console.log('   5. Include Content-Type: application/json header');
  console.log('   6. Check server logs for detailed error messages');
}

// Run diagnostics if executed directly
if (require.main === module) {
  runDiagnostics().catch(console.error);
}

console.log('🔧 Quick Test Commands:\n');

console.log('Test missing fields:');
console.log(`curl -X POST "${API_BASE}${API_ENDPOINT}" -H "Content-Type: application/json" -d '{"customerId":"1"}'`);

console.log('\nTest invalid documentType:');
console.log(`curl -X POST "${API_BASE}${API_ENDPOINT}" -H "Content-Type: application/json" -d '{"documentType":"invalid","customerId":"1","exportType":"docx"}'`);

console.log('\nTest valid request:');
console.log(`curl -X POST "${API_BASE}${API_ENDPOINT}" -H "Content-Type: application/json" -d '{"documentType":"to_trinh_tham_dinh","customerId":"1","exportType":"docx"}'`);

console.log('\n📊 Expected API Response Formats:\n');

console.log('✅ Success (200):');
console.log(`{
  "blobUrl": "https://blob.vercel-storage.com/...",
  "filename": "to_trinh_tham_dinh_1_20250824_123456.docx",
  "message": "Document generated successfully"
}`);

console.log('\n❌ Error (400):');
console.log(`{
  "error": "Missing required fields: documentType, customerId, exportType"
}`);

console.log('\n❌ Error (400):'); 
console.log(`{
  "error": "Invalid document type: invalid_type. Valid types: hop_dong_tin_dung, to_trinh_tham_dinh, ..."
}`);
