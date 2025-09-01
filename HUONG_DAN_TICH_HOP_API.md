# 📚 Hướng Dẫn Tích Hợp Document API - CRM System

## Tổng Quan
Document API cho phép các hệ thống bên ngoài tích hợp với CRM để:
- Quản lý templates (mẫu tài liệu)
- Tạo tài liệu tự động từ templates
- Lưu trữ và quản lý tài liệu đã tạo
- Gửi tài liệu qua email

**Base URL Production**: `https://crm.titi.io.vn/api`
**Authentication**: API Key (sẽ được cấu hình)
**Format**: JSON

---

## 🔧 Cấu Hình Tích Hợp

### 1. Thông Tin Kết Nối
```javascript
const API_CONFIG = {
  baseUrl: 'https://crm.titi.io.vn/api',
  // apiKey: 'your-api-key', // Sẽ được cấu hình sau
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer your-api-key'
  }
};
```

### 2. Dependencies Cần Thiết
```bash
# Node.js/JavaScript
npm install axios

# Python
pip install requests

# PHP
composer require guzzlehttp/guzzle
```

---

## 📋 1. QUẢN LÝ TEMPLATES

### 1.1 Lấy Danh Sách Templates
**Endpoint**: `GET /templates`

```javascript
// JavaScript/Node.js
const axios = require('axios');

async function getTemplates(templateType = null) {
  try {
    const url = templateType 
      ? `${API_CONFIG.baseUrl}/templates?type=${templateType}`
      : `${API_CONFIG.baseUrl}/templates`;
    
    const response = await axios.get(url, {
      headers: API_CONFIG.headers
    });
    
    return response.data.templates;
  } catch (error) {
    console.error('Error fetching templates:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const allTemplates = await getTemplates();
const creditTemplates = await getTemplates('hop_dong_tin_dung');
```

```python
# Python
import requests

def get_templates(template_type=None):
    url = f"{API_CONFIG['baseUrl']}/templates"
    params = {'type': template_type} if template_type else {}
    
    response = requests.get(url, headers=API_CONFIG['headers'], params=params)
    response.raise_for_status()
    
    return response.json()['templates']

# Sử dụng
all_templates = get_templates()
credit_templates = get_templates('hop_dong_tin_dung')
```

```php
// PHP
use GuzzleHttp\Client;

function getTemplates($templateType = null) {
    $client = new Client();
    $url = $GLOBALS['API_CONFIG']['baseUrl'] . '/templates';
    
    $options = [
        'headers' => $GLOBALS['API_CONFIG']['headers']
    ];
    
    if ($templateType) {
        $options['query'] = ['type' => $templateType];
    }
    
    $response = $client->get($url, $options);
    $data = json_decode($response->getBody(), true);
    
    return $data['templates'];
}

// Sử dụng
$allTemplates = getTemplates();
$creditTemplates = getTemplates('hop_dong_tin_dung');
```

### 1.2 Upload Template Mới
**Endpoint**: `POST /templates/upload`

```javascript
// JavaScript/Node.js với FormData
async function uploadTemplate(fileBuffer, fileName, templateName, templateType) {
  const FormData = require('form-data');
  
  const formData = new FormData();
  formData.append('file', fileBuffer, fileName);
  formData.append('templateName', templateName);
  formData.append('templateType', templateType);
  
  try {
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/templates/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          // 'Authorization': 'Bearer your-api-key'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading template:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const fs = require('fs');
const fileBuffer = fs.readFileSync('template.docx');
const result = await uploadTemplate(
  fileBuffer, 
  'template.docx',
  'Hợp Đồng Tín Dụng Mới',
  'hop_dong_tin_dung'
);
```

```python
# Python
def upload_template(file_path, template_name, template_type):
    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {
            'templateName': template_name,
            'templateType': template_type
        }
        
        response = requests.post(
            f"{API_CONFIG['baseUrl']}/templates/upload",
            files=files,
            data=data,
            headers={'Authorization': 'Bearer your-api-key'}
        )
        
        response.raise_for_status()
        return response.json()

# Sử dụng
result = upload_template(
    'template.docx',
    'Hợp Đồng Tín Dụng Mới',
    'hop_dong_tin_dung'
)
```

---

## 📄 2. TẠO TÀI LIỆU

### 2.1 Tạo Tài Liệu và Tải Xuống
**Endpoint**: `POST /documents`

```javascript
// JavaScript/Node.js
async function generateDocument({
  templateId,
  customerId,
  collateralId = null,
  creditAssessmentId = null,
  exportType = 'docx'
}) {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/documents`,
      {
        templateId,
        customerId,
        collateralId,
        creditAssessmentId,
        exportType
      },
      {
        headers: API_CONFIG.headers,
        responseType: 'blob' // Quan trọng để nhận file binary
      }
    );
    
    // Lưu file
    const fs = require('fs');
    const filename = `document_${Date.now()}.${exportType}`;
    fs.writeFileSync(filename, response.data);
    
    return {
      filename,
      contentType: response.headers['content-type'],
      size: response.data.length
    };
  } catch (error) {
    console.error('Error generating document:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const document = await generateDocument({
  templateId: 6,
  customerId: 1,
  exportType: 'docx'
});
console.log(`Document saved as: ${document.filename}`);
```

### 2.2 Tạo Tài Liệu và Lưu vào Cloud Storage
**Endpoint**: `POST /documents?return=json`

```javascript
// JavaScript/Node.js
async function generateDocumentToCloud({
  templateId,
  customerId,
  collateralId = null,
  creditAssessmentId = null,
  exportType = 'docx'
}) {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/documents?return=json`,
      {
        templateId,
        customerId,
        collateralId,
        creditAssessmentId,
        exportType
      },
      {
        headers: API_CONFIG.headers
      }
    );
    
    return {
      success: response.data.success,
      filename: response.data.filename,
      downloadUrl: response.data.blobUrl,
      fileSize: response.data.fileSize,
      contentType: response.data.contentType
    };
  } catch (error) {
    console.error('Error generating document to cloud:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const result = await generateDocumentToCloud({
  templateId: 6,
  customerId: 1,
  exportType: 'docx'
});

console.log(`Document URL: ${result.downloadUrl}`);
```

```python
# Python
def generate_document_to_cloud(template_id, customer_id, export_type='docx', 
                               collateral_id=None, credit_assessment_id=None):
    data = {
        'templateId': template_id,
        'customerId': customer_id,
        'exportType': export_type
    }
    
    if collateral_id:
        data['collateralId'] = collateral_id
    if credit_assessment_id:
        data['creditAssessmentId'] = credit_assessment_id
    
    response = requests.post(
        f"{API_CONFIG['baseUrl']}/documents?return=json",
        json=data,
        headers=API_CONFIG['headers']
    )
    
    response.raise_for_status()
    return response.json()

# Sử dụng
result = generate_document_to_cloud(
    template_id=6,
    customer_id=1,
    export_type='docx'
)

print(f"Document URL: {result['blobUrl']}")
```

---

## 🗄️ 3. QUẢN LÝ DỮ LIỆU

### 3.1 Lấy Danh Sách Tài Liệu Đã Tạo
**Endpoint**: `GET /database/documents`

```javascript
// JavaScript/Node.js
async function getDocuments({
  customerId = null,
  documentType = null,
  limit = 50,
  offset = 0
} = {}) {
  try {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    if (documentType) params.append('document_type', documentType);
    params.append('limit', limit);
    params.append('offset', offset);
    
    const response = await axios.get(
      `${API_CONFIG.baseUrl}/database/documents?${params}`,
      { headers: API_CONFIG.headers }
    );
    
    return {
      documents: response.data.documents,
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Error fetching documents:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const result = await getDocuments({
  customerId: 1,
  documentType: 'hop_dong_tin_dung',
  limit: 20
});

console.log(`Found ${result.documents.length} documents`);
result.documents.forEach(doc => {
  console.log(`- ${doc.file_name} (${doc.created_at})`);
});
```

### 3.2 Tạo Record Tài Liệu
**Endpoint**: `POST /database/documents`

```javascript
// JavaScript/Node.js
async function createDocumentRecord({
  documentType,
  customerId,
  templateId,
  fileName,
  fileUrl,
  fileSize,
  fileExtension,
  collateralId = null,
  assessmentId = null
}) {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/database/documents`,
      {
        document_type: documentType,
        customer_id: customerId,
        template_id: templateId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        file_extension: fileExtension,
        collateral_id: collateralId,
        assessment_id: assessmentId
      },
      { headers: API_CONFIG.headers }
    );
    
    return response.data.document;
  } catch (error) {
    console.error('Error creating document record:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const documentRecord = await createDocumentRecord({
  documentType: 'hop_dong_tin_dung',
  customerId: 1,
  templateId: 6,
  fileName: 'contract_customer001_20240901.docx',
  fileUrl: 'https://blob.vercel-storage.com/documents/contract_customer001_20240901.docx',
  fileSize: 45632,
  fileExtension: 'docx'
});
```

---

## 📧 4. GỬI TÀI LIỆU QUA EMAIL

### 4.1 Gửi Tài Liệu Đã Tạo
**Endpoint**: `POST /documents/sendmail`

```javascript
// JavaScript/Node.js
async function sendDocumentByEmail({
  fileName,
  email,
  subject,
  message
}) {
  try {
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/documents/sendmail`,
      {
        fileName,
        email,
        subject,
        message
      },
      { headers: API_CONFIG.headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error sending document:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
const result = await sendDocumentByEmail({
  fileName: 'contract_customer001_20240901.docx',
  email: 'customer@example.com',
  subject: 'Hợp đồng tín dụng của bạn',
  message: 'Kính gửi quý khách, đính kèm là hợp đồng tín dụng. Vui lòng xem xét và phản hồi.'
});

console.log('Email sent successfully:', result.success);
```

---

## 🔍 5. WORKFLOW TÍCH HỢP HOÀN CHỈNH

### 5.1 Workflow Tạo Tài Liệu Tự Động
```javascript
// JavaScript/Node.js - Complete Workflow
class DocumentAPIClient {
  constructor(baseUrl, apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headers = {
      'Content-Type': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    };
  }

  async autoGenerateAndSendDocument({
    templateId,
    customerId,
    customerEmail,
    documentType,
    exportType = 'docx',
    emailSubject = 'Tài liệu từ hệ thống CRM',
    emailMessage = 'Đính kèm tài liệu yêu cầu.'
  }) {
    try {
      console.log('1. Tạo tài liệu...');
      
      // Bước 1: Tạo tài liệu và lưu vào cloud
      const documentResult = await axios.post(
        `${this.baseUrl}/documents?return=json`,
        {
          templateId,
          customerId,
          exportType
        },
        { headers: this.headers }
      );

      console.log('2. Lưu thông tin tài liệu vào database...');
      
      // Bước 2: Tạo record trong database
      const recordResult = await axios.post(
        `${this.baseUrl}/database/documents`,
        {
          document_type: documentType,
          customer_id: customerId,
          template_id: templateId,
          file_name: documentResult.data.filename,
          file_url: documentResult.data.blobUrl,
          file_size: documentResult.data.fileSize,
          file_extension: exportType
        },
        { headers: this.headers }
      );

      console.log('3. Gửi email...');
      
      // Bước 3: Gửi email
      const emailResult = await axios.post(
        `${this.baseUrl}/documents/sendmail`,
        {
          fileName: documentResult.data.filename,
          email: customerEmail,
          subject: emailSubject,
          message: emailMessage
        },
        { headers: this.headers }
      );

      return {
        success: true,
        document: {
          id: recordResult.data.document.document_id,
          filename: documentResult.data.filename,
          downloadUrl: documentResult.data.blobUrl,
          size: documentResult.data.fileSize
        },
        emailSent: emailResult.data.success
      };

    } catch (error) {
      console.error('Workflow error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Sử dụng
const client = new DocumentAPIClient('https://crm.titi.io.vn/api');

const result = await client.autoGenerateAndSendDocument({
  templateId: 6,
  customerId: 1,
  customerEmail: 'customer@example.com',
  documentType: 'hop_dong_tin_dung',
  exportType: 'docx',
  emailSubject: 'Hợp đồng tín dụng cá nhân',
  emailMessage: 'Kính gửi quý khách, đính kèm hợp đồng tín dụng cá nhân. Vui lòng ký và gửi lại.'
});

console.log('Document generated and sent:', result);
```

---

## 🚨 6. XỬ LÝ LỖI VÀ DEBUGGING

### 6.1 Error Handling Pattern
```javascript
// JavaScript/Node.js
class APIError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function safeApiCall(apiFunction, ...args) {
  try {
    return await apiFunction(...args);
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new APIError(
        data.error?.message || data.error || 'API Error',
        status,
        data.error?.details || data
      );
    } else if (error.request) {
      // Network error
      throw new APIError('Network Error: Unable to reach API', 0, error.message);
    } else {
      // Other error
      throw new APIError(error.message, 0, error);
    }
  }
}

// Sử dụng với retry logic
async function generateDocumentWithRetry(params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await safeApiCall(generateDocumentToCloud, params);
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

### 6.2 Debugging Template Issues
```javascript
// Debug template access
async function debugTemplate(templateId) {
  try {
    const response = await axios.get(
      `${API_CONFIG.baseUrl}/templates/debug?templateId=${templateId}`,
      { headers: API_CONFIG.headers }
    );
    
    console.log('Template Debug Info:');
    console.log('- Template:', response.data.template);
    console.log('- URL Analysis:', response.data.urlAnalysis);
    console.log('- Fetch Test:', response.data.fetchTest);
    console.log('- Environment:', response.data.environment);
    
    return response.data;
  } catch (error) {
    console.error('Debug failed:', error.response?.data || error.message);
    throw error;
  }
}

// Sử dụng
await debugTemplate(6);
```

---

## 📊 7. MONITORING VÀ ANALYTICS

### 7.1 Theo Dõi Trạng Thái API
```javascript
// Health check endpoint
async function checkAPIHealth() {
  try {
    const response = await axios.get(`${API_CONFIG.baseUrl}/templates`);
    return {
      status: 'healthy',
      responseTime: response.headers['x-response-time'] || 'N/A',
      templatesCount: response.data.templates.length
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      statusCode: error.response?.status
    };
  }
}

// Usage statistics
async function getUsageStats() {
  try {
    const response = await axios.get(
      `${API_CONFIG.baseUrl}/analytics/documents`,
      { headers: API_CONFIG.headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Unable to fetch usage stats:', error.message);
    return null;
  }
}
```

---

## 🛠️ 8. CÁC LOẠI TEMPLATE HỖ TRỢ

### 8.1 Template Types
```javascript
const TEMPLATE_TYPES = {
  'hop_dong_tin_dung': 'Hợp đồng tín dụng',
  'to_trinh_tham_dinh': 'Tờ trình thẩm định',
  'giay_de_nghi_vay_von': 'Giấy đề nghị vay vốn',
  'bien_ban_dinh_gia': 'Biên bản định giá',
  'hop_dong_the_chap': 'Hợp đồng thế chấp',
  'don_dang_ky_the_chap': 'Đơn đăng ký thế chấp',
  'hop_dong_thu_phi': 'Hợp đồng thu phí',
  'tai_lieu_khac': 'Tài liệu khác'
};

// Template placeholders hỗ trợ
const SUPPORTED_PLACEHOLDERS = {
  // Customer data
  '{{customer_name}}': 'Tên khách hàng',
  '{{full_name}}': 'Họ tên đầy đủ',
  '{{id_number}}': 'Số CMND/CCCD',
  '{{phone}}': 'Số điện thoại',
  '{{email}}': 'Email',
  '{{address}}': 'Địa chỉ',
  
  // Financial data
  '{{loan_amount}}': 'Số tiền vay',
  '{{loan_amount_formatted}}': 'Số tiền vay (định dạng)',
  '{{interest_rate}}': 'Lãi suất',
  '{{loan_term}}': 'Thời hạn vay',
  
  // Dates
  '{{current_date}}': 'Ngày hiện tại',
  '{{current_year}}': 'Năm hiện tại',
  '{{current_month}}': 'Tháng hiện tại',
  '{{current_day}}': 'Ngày hiện tại (số)',
  
  // Collateral data
  '{{collateral_type}}': 'Loại tài sản thế chấp',
  '{{collateral_value}}': 'Giá trị tài sản',
  '{{collateral_description}}': 'Mô tả tài sản'
};
```

---

## ⚡ 9. PRODUCTION TIPS

### 9.1 Best Practices
```javascript
// 1. Connection pooling và timeout
const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: 30000, // 30 seconds
  headers: API_CONFIG.headers
});

// 2. Rate limiting handling
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return axiosInstance.request(error.config);
    }
    throw error;
  }
);

// 3. Batch processing
async function generateMultipleDocuments(requests) {
  const BATCH_SIZE = 5;
  const results = [];
  
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(request => 
      generateDocumentWithRetry(request).catch(error => ({ error: error.message }))
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches
    if (i + BATCH_SIZE < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
```

---

## 📞 10. SUPPORT VÀ LIÊN HỆ

### 10.1 Thông Tin Hỗ Trợ
- **Production URL**: https://crm.titi.io.vn/api
- **Documentation**: Có sẵn trong repository
- **Status Page**: Kiểm tra tại `GET /templates` để xác nhận API hoạt động

### 10.2 Troubleshooting Common Issues
```javascript
// Common issues and solutions
const TROUBLESHOOTING = {
  'Template file not found': 'Kiểm tra templateId có tồn tại, sử dụng GET /templates',
  'Customer information not found': 'Thêm customer data vào database',
  'Network timeout': 'Tăng timeout setting, kiểm tra kết nối mạng',
  '404 endpoint': 'Kiểm tra URL endpoint, đợi deployment hoàn tất',
  'File too large': 'Template file không được vượt quá 50MB'
};

// Auto-diagnostics
async function runDiagnostics() {
  console.log('🔍 Running API Diagnostics...\n');
  
  // 1. Check API connectivity
  try {
    await checkAPIHealth();
    console.log('✅ API connectivity: OK');
  } catch (error) {
    console.log('❌ API connectivity: FAILED');
    console.log('   Reason:', error.message);
  }
  
  // 2. Check templates availability
  try {
    const templates = await getTemplates();
    console.log(`✅ Templates: ${templates.length} available`);
  } catch (error) {
    console.log('❌ Templates: FAILED');
  }
  
  // 3. Test document generation (if customer exists)
  // ... additional checks
}

// Run diagnostics
await runDiagnostics();
```

---

## 🎯 KẾT LUẬN

Document API cung cấp đầy đủ các chức năng cần thiết để tích hợp tạo tài liệu tự động vào hệ thống của bạn. 

**Các bước tích hợp chính**:
1. ✅ Cấu hình kết nối API
2. ✅ Upload templates (DOCX format với placeholders)
3. ✅ Chuẩn bị dữ liệu khách hàng
4. ✅ Gọi API tạo tài liệu
5. ✅ Xử lý kết quả và gửi email (tùy chọn)

**Hệ thống đã sẵn sàng** cho production use với template processing hoàn chỉnh và file storage tích hợp!
