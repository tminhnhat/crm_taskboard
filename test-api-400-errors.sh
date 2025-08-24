#!/usr/bin/env bash
# API Testing Script for Document Generation
# Use this to test the API and identify 400 errors

echo "🔍 Testing Document Generation API"
echo "=================================="
echo

API_URL="https://crm.titi.io.vn/api/documents?return=json"

echo "Testing API: $API_URL"
echo

# Test 1: Missing documentType
echo "🧪 Test 1: Missing documentType (should return 400)"
echo "Request: Missing documentType field"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "1",
    "exportType": "docx"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 2: Missing customerId
echo "🧪 Test 2: Missing customerId (should return 400)"
echo "Request: Missing customerId field"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "exportType": "docx"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 3: Missing exportType
echo "🧪 Test 3: Missing exportType (should return 400)"
echo "Request: Missing exportType field"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 4: Invalid documentType
echo "🧪 Test 4: Invalid documentType (should return 400)"
echo "Request: Invalid documentType value"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "invalid_document_type",
    "customerId": "1",
    "exportType": "docx"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 5: Invalid exportType
echo "🧪 Test 5: Invalid exportType (should return 400)"
echo "Request: Invalid exportType value"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "exportType": "pdf"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 6: Valid request (might fail due to other issues)
echo "🧪 Test 6: Valid request (should work or fail with specific error)"
echo "Request: All required fields with valid values"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "collateralId": "1",
    "creditAssessmentId": "1",
    "exportType": "docx"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

# Test 7: Malformed JSON
echo "🧪 Test 7: Malformed JSON (should return 400)"
echo "Request: Invalid JSON syntax"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "exportType": "docx"
  ' | jq . 2>/dev/null || echo "Response is not valid JSON (expected for malformed JSON test)"
echo
echo "---"
echo

# Test 8: Missing Content-Type header
echo "🧪 Test 8: Missing Content-Type header (might cause issues)"
echo "Request: No Content-Type header"
curl -s -X POST "$API_URL" \
  -d '{
    "documentType": "to_trinh_tham_dinh",
    "customerId": "1",
    "exportType": "docx"
  }' | jq . 2>/dev/null || echo "Response is not valid JSON"
echo
echo "---"
echo

echo "📋 Summary"
echo "========="
echo
echo "✅ Valid Document Types:"
echo "   • hop_dong_tin_dung"
echo "   • to_trinh_tham_dinh" 
echo "   • giay_de_nghi_vay_von"
echo "   • bien_ban_dinh_gia"
echo "   • hop_dong_the_chap"
echo "   • bang_tinh_lai"
echo "   • lich_tra_no"
echo
echo "✅ Valid Export Types:"
echo "   • docx (Word document)"
echo "   • xlsx (Excel spreadsheet)"
echo
echo "📝 Required Fields:"
echo "   • documentType (string)"
echo "   • customerId (string)"
echo "   • exportType (string)"
echo
echo "📝 Optional Fields:"
echo "   • collateralId (string)"
echo "   • creditAssessmentId (string)"
echo
echo "💡 Common 400 Error Causes:"
echo "   1. Missing required fields"
echo "   2. Invalid documentType or exportType values"
echo "   3. Malformed JSON in request body"
echo "   4. Missing Content-Type: application/json header"
echo
echo "🔧 Example Working Request:"
echo 'curl -X POST "https://crm.titi.io.vn/api/documents?return=json" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{'
echo '    "documentType": "to_trinh_tham_dinh",'
echo '    "customerId": "1",'
echo '    "exportType": "docx"'
echo '  }'"'"
