#!/bin/bash

echo "=== Testing Document Generation API ==="
echo "Server: http://localhost:3000"
echo

# Test document generation
echo "1. Testing Document Generation..."
response=$(curl -s -X POST "http://localhost:3000/api/documents" \
  -H "Content-Type: application/json" \
  -d '{"documentType":"hop_dong_tin_dung","customerId":"1","exportType":"docx"}' \
  -w "HTTPSTATUS:%{http_code}" \
  -o test_document.docx)

http_code=$(echo $response | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)

if [ "$http_code" -eq 200 ]; then
  echo "✓ Document generation successful (HTTP $http_code)"
  echo "  File size: $(wc -c < test_document.docx) bytes"
else
  echo "✗ Document generation failed (HTTP $http_code)"
  if [ -f "test_document.docx" ]; then
    echo "  Response: $(cat test_document.docx)"
  fi
fi

echo

# Test template seeding
echo "2. Testing Template Seeding..."
seed_response=$(curl -s -X POST "http://localhost:3000/api/templates/seed" \
  -H "Content-Type: application/json" \
  -d '{"action":"seed"}' \
  -w "HTTPSTATUS:%{http_code}")

seed_http_code=$(echo $seed_response | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
seed_body=$(echo $seed_response | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$seed_http_code" -eq 200 ]; then
  echo "✓ Template seeding successful (HTTP $seed_http_code)"
  echo "  Response: $seed_body"
else
  echo "✗ Template seeding failed (HTTP $seed_http_code)"
  echo "  Response: $seed_body"
fi

echo
echo "=== Test Complete ==="
