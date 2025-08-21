#!/usr/bin/env node
console.log('=== Testing Document System ===');

async function testTemplateSeeding() {
  console.log('\n1. Testing template seeding...');
  try {
    const response = await fetch('http://localhost:3000/api/templates/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed' }),
    });
    
    const data = await response.json();
    console.log('✓ Seed result:', data.success ? 'SUCCESS' : 'FAILED');
    if (!data.success) console.log('  Error:', data.message);
  } catch (error) {
    console.log('✗ Seed failed:', error.message);
  }
}

async function testTemplateList() {
  console.log('\n2. Testing template list...');
  try {
    const response = await fetch('http://localhost:3000/api/templates/seed');
    const data = await response.json();
    console.log('✓ Templates found:', data.templates?.length || 0);
    console.log('  Templates:', data.templates);
  } catch (error) {
    console.log('✗ List failed:', error.message);
  }
}

async function testDocumentGeneration() {
  console.log('\n3. Testing document generation...');
  try {
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType: 'hop_dong_tin_dung',
        customerId: 'test-customer-123',
        exportType: 'docx'
      }),
    });
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      console.log('✓ Document generated successfully');
      console.log('  File size:', contentLength, 'bytes');
      console.log('  Content type:', response.headers.get('content-type'));
    } else {
      const errorData = await response.json();
      console.log('✗ Generation failed:', errorData.error);
    }
  } catch (error) {
    console.log('✗ Generation failed:', error.message);
  }
}

async function runTests() {
  await testTemplateSeeding();
  await testTemplateList();
  await testDocumentGeneration();
  console.log('\n=== Test Complete ===');
}

if (process.argv[2] === 'run') {
  runTests();
} else {
  console.log('Usage: node test-document-system.js run');
  console.log('Make sure the Next.js server is running on localhost:3000');
}
