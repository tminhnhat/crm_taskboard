# 🔗 Ví Dụ Tích Hợp Thực Tế - Document API

## 1. 🏦 Tích Hợp với Hệ Thống Core Banking

### 1.1 Workflow Tự Động Tạo Hợp Đồng Tín Dụng
```javascript
// banking-integration.js
class BankingDocumentIntegration {
  constructor() {
    this.crmApi = 'https://crm.titi.io.vn/api';
    this.coreApi = 'https://your-banking-core.com/api';
  }

  // Khi có loan application mới được approve
  async onLoanApproved(applicationId) {
    try {
      console.log(`Processing approved loan: ${applicationId}`);

      // 1. Lấy thông tin từ core banking
      const loanData = await this.getLoanApplication(applicationId);
      const customerData = await this.getCustomerInfo(loanData.customerId);

      // 2. Sync customer data với CRM
      const crmCustomerId = await this.syncCustomerToCRM(customerData);

      // 3. Chọn template phù hợp
      const templateId = await this.selectTemplate(loanData.productType);

      // 4. Tạo hợp đồng tự động
      const document = await this.generateContract({
        templateId,
        customerId: crmCustomerId,
        loanData,
        exportType: 'docx'
      });

      // 5. Lưu document reference vào core banking
      await this.updateLoanWithDocument(applicationId, document);

      // 6. Gửi email cho khách hàng
      await this.sendContractEmail(customerData.email, document);

      return {
        success: true,
        documentId: document.id,
        downloadUrl: document.downloadUrl
      };

    } catch (error) {
      console.error('Contract generation failed:', error);
      throw error;
    }
  }

  async syncCustomerToCRM(customerData) {
    // Kiểm tra customer đã tồn tại chưa
    const existingCustomer = await axios.get(
      `${this.crmApi}/customers?id_number=${customerData.idNumber}`
    ).catch(() => null);

    if (existingCustomer?.data.customers.length > 0) {
      return existingCustomer.data.customers[0].customer_id;
    }

    // Tạo customer mới trong CRM
    const newCustomer = await axios.post(`${this.crmApi}/customers`, {
      full_name: customerData.fullName,
      id_number: customerData.idNumber,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address,
      date_of_birth: customerData.dateOfBirth
    });

    return newCustomer.data.customer.customer_id;
  }

  async generateContract({ templateId, customerId, loanData, exportType }) {
    const response = await axios.post(
      `${this.crmApi}/documents?return=json`,
      {
        templateId,
        customerId,
        exportType,
        // Additional context data
        contextData: {
          loan_amount: loanData.amount,
          interest_rate: loanData.interestRate,
          loan_term: loanData.term,
          monthly_payment: loanData.monthlyPayment,
          loan_purpose: loanData.purpose
        }
      }
    );

    return {
      id: response.data.documentId,
      filename: response.data.filename,
      downloadUrl: response.data.blobUrl,
      size: response.data.fileSize
    };
  }
}

// Usage in core banking system
const integration = new BankingDocumentIntegration();

// Hook into loan approval process
coreSystem.onEvent('loan.approved', async (event) => {
  try {
    await integration.onLoanApproved(event.applicationId);
    console.log('Contract generated successfully');
  } catch (error) {
    console.error('Failed to generate contract:', error);
    // Notify operations team
    await notifyOpsTeam(error, event.applicationId);
  }
});
```

---

## 2. 🏢 Tích Hợp với CRM/ERP Enterprise

### 2.1 Salesforce Integration
```javascript
// salesforce-integration.js
const jsforce = require('jsforce');

class SalesforceDocumentSync {
  constructor(sfUsername, sfPassword, sfToken) {
    this.conn = new jsforce.Connection();
    this.crmApi = 'https://crm.titi.io.vn/api';
  }

  async init() {
    await this.conn.login(this.sfUsername, this.sfPassword + this.sfToken);
  }

  // Sync opportunity thành hợp đồng tự động
  async syncOpportunityToContract(opportunityId) {
    try {
      // 1. Lấy thông tin opportunity từ Salesforce
      const opp = await this.conn.sobject('Opportunity').retrieve(opportunityId);
      const account = await this.conn.sobject('Account').retrieve(opp.AccountId);

      // 2. Tạo customer trong CRM
      const customer = await this.createCRMCustomer(account);

      // 3. Tạo hợp đồng dựa trên opportunity type
      const templateMapping = {
        'Personal Loan': 6, // Template ID cho personal loan
        'Business Loan': 7, // Template ID cho business loan
        'Mortgage': 8       // Template ID cho mortgage
      };

      const templateId = templateMapping[opp.Type] || 6;

      const document = await axios.post(
        `${this.crmApi}/documents?return=json`,
        {
          templateId,
          customerId: customer.id,
          exportType: 'docx'
        }
      );

      // 4. Update opportunity với document info
      await this.conn.sobject('Opportunity').update({
        Id: opportunityId,
        Contract_Document_URL__c: document.data.blobUrl,
        Contract_Generated__c: true,
        Contract_Generated_Date__c: new Date().toISOString()
      });

      // 5. Tạo task follow-up
      await this.conn.sobject('Task').create({
        Subject: 'Review Generated Contract',
        Description: `Contract generated for ${account.Name}. URL: ${document.data.blobUrl}`,
        WhatId: opportunityId,
        ActivityDate: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]
      });

      return document.data;

    } catch (error) {
      console.error('Salesforce sync error:', error);
      throw error;
    }
  }

  // Batch sync multiple opportunities
  async batchSyncContracts(opportunityIds) {
    const results = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < opportunityIds.length; i += BATCH_SIZE) {
      const batch = opportunityIds.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(id => 
        this.syncOpportunityToContract(id).catch(error => ({ error, id }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

// Usage
const sfSync = new SalesforceDocumentSync(
  process.env.SF_USERNAME,
  process.env.SF_PASSWORD,
  process.env.SF_TOKEN
);

await sfSync.init();
await sfSync.syncOpportunityToContract('006XXXXXXXXXXXX');
```

### 2.2 SAP Integration
```javascript
// sap-integration.js
class SAPDocumentIntegration {
  constructor(sapEndpoint, sapUser, sapPassword) {
    this.sapApi = sapEndpoint;
    this.crmApi = 'https://crm.titi.io.vn/api';
    this.sapAuth = Buffer.from(`${sapUser}:${sapPassword}`).toString('base64');
  }

  // Tích hợp với SAP Business Partner
  async syncBusinessPartnerContract(bpNumber) {
    try {
      // 1. Lấy business partner từ SAP
      const sapBP = await axios.get(
        `${this.sapApi}/A_BusinessPartner('${bpNumber}')`,
        {
          headers: {
            'Authorization': `Basic ${this.sapAuth}`,
            'Accept': 'application/json'
          }
        }
      );

      // 2. Map SAP data sang CRM format
      const customerData = this.mapSAPToCRM(sapBP.data.d);

      // 3. Tạo customer trong CRM
      const customer = await axios.post(
        `${this.crmApi}/customers`,
        customerData
      );

      // 4. Tạo document dựa trên BP category
      const templateId = this.getTemplateByBPCategory(sapBP.data.d.BusinessPartnerCategory);

      const document = await axios.post(
        `${this.crmApi}/documents?return=json`,
        {
          templateId,
          customerId: customer.data.customer_id,
          exportType: 'docx'
        }
      );

      // 5. Update SAP với document reference
      await axios.patch(
        `${this.sapApi}/A_BusinessPartner('${bpNumber}')`,
        {
          YY1_ContractDocURL_bus: document.data.blobUrl,
          YY1_ContractGenerated_bus: true
        },
        {
          headers: {
            'Authorization': `Basic ${this.sapAuth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return document.data;

    } catch (error) {
      console.error('SAP integration error:', error);
      throw error;
    }
  }

  mapSAPToCRM(sapData) {
    return {
      full_name: sapData.BusinessPartnerFullName,
      id_number: sapData.YY1_TaxID_bus,
      phone: sapData.YY1_Phone_bus,
      email: sapData.YY1_Email_bus,
      address: sapData.YY1_Address_bus,
      sap_bp_number: sapData.BusinessPartner
    };
  }

  getTemplateByBPCategory(category) {
    const mapping = {
      '1': 6, // Individual -> Personal loan template
      '2': 7, // Corporate -> Business loan template
      '3': 8  // Bank -> Special template
    };
    return mapping[category] || 6;
  }
}
```

---

## 3. 📱 Tích Hợp với Mobile App

### 3.1 React Native Integration
```javascript
// mobile-app-integration.js
import AsyncStorage from '@react-native-async-storage/async-storage';

class MobileDocumentService {
  constructor() {
    this.baseUrl = 'https://crm.titi.io.vn/api';
  }

  async uploadTemplateFromMobile(fileUri, templateName, templateType) {
    try {
      const formData = new FormData();
      
      // Add file from mobile device
      formData.append('file', {
        uri: fileUri,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        name: 'template.docx'
      });
      
      formData.append('templateName', templateName);
      formData.append('templateType', templateType);

      const response = await fetch(`${this.baseUrl}/templates/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        // Cache template info locally
        await this.cacheTemplateInfo(result.template);
        return result;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Mobile upload error:', error);
      throw error;
    }
  }

  async generateDocumentOfflineReady(params) {
    try {
      // Check online status
      const isOnline = await this.checkConnectivity();
      
      if (!isOnline) {
        // Queue for later processing
        await this.queueDocumentRequest(params);
        return { queued: true, message: 'Yêu cầu đã được lưu, sẽ xử lý khi có mạng' };
      }

      // Process immediately if online
      const response = await fetch(`${this.baseUrl}/documents?return=json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const result = await response.json();

      if (response.ok) {
        // Cache result
        await this.cacheDocumentResult(result);
        return result;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      // Fallback to offline queue
      await this.queueDocumentRequest(params);
      return { 
        queued: true, 
        error: error.message,
        message: 'Lỗi kết nối, yêu cầu đã được lưu'
      };
    }
  }

  async processOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem('documentQueue');
      if (!queue) return [];

      const requests = JSON.parse(queue);
      const results = [];

      for (const request of requests) {
        try {
          const result = await this.generateDocumentOfflineReady(request);
          results.push({ ...request, result, status: 'success' });
        } catch (error) {
          results.push({ ...request, error: error.message, status: 'failed' });
        }
      }

      // Clear processed requests
      const failedRequests = results
        .filter(r => r.status === 'failed')
        .map(r => ({ templateId: r.templateId, customerId: r.customerId, exportType: r.exportType }));

      await AsyncStorage.setItem('documentQueue', JSON.stringify(failedRequests));

      return results;

    } catch (error) {
      console.error('Queue processing error:', error);
      return [];
    }
  }

  async cacheTemplateInfo(template) {
    const cached = await AsyncStorage.getItem('cachedTemplates') || '[]';
    const templates = JSON.parse(cached);
    
    const existingIndex = templates.findIndex(t => t.template_id === template.template_id);
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    await AsyncStorage.setItem('cachedTemplates', JSON.stringify(templates));
  }
}

// React Native Component Usage
const DocumentScreen = () => {
  const [documentService] = useState(new MobileDocumentService());
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDocument = async (templateId, customerId) => {
    setIsGenerating(true);
    
    try {
      const result = await documentService.generateDocumentOfflineReady({
        templateId,
        customerId,
        exportType: 'docx'
      });

      if (result.queued) {
        Alert.alert('Thông báo', result.message);
      } else {
        // Open document or show success
        Alert.alert('Thành công', `Tài liệu đã tạo: ${result.filename}`);
        // Linking.openURL(result.blobUrl); // Open document
      }

    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View>
      <Button
        title={isGenerating ? "Đang tạo..." : "Tạo tài liệu"}
        onPress={() => handleGenerateDocument(6, 1)}
        disabled={isGenerating}
      />
    </View>
  );
};
```

---

## 4. 🌐 Tích Hợp với Website/Portal

### 4.1 WordPress Plugin Integration
```php
<?php
// wordpress-crm-documents.php

class CRMDocumentPlugin {
    private $apiBase = 'https://crm.titi.io.vn/api';
    
    public function __construct() {
        add_action('wp_ajax_generate_document', array($this, 'generateDocument'));
        add_action('wp_ajax_nopriv_generate_document', array($this, 'generateDocument'));
        add_shortcode('crm_document_form', array($this, 'renderDocumentForm'));
    }
    
    public function generateDocument() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'], 'crm_document_nonce')) {
                wp_die('Security check failed');
            }
            
            $templateId = intval($_POST['template_id']);
            $customerData = array(
                'full_name' => sanitize_text_field($_POST['full_name']),
                'phone' => sanitize_text_field($_POST['phone']),
                'email' => sanitize_email($_POST['email']),
                'address' => sanitize_textarea_field($_POST['address'])
            );
            
            // Create customer in CRM
            $customerId = $this->createOrUpdateCustomer($customerData);
            
            // Generate document
            $document = $this->callCRMAPI('/documents?return=json', 'POST', array(
                'templateId' => $templateId,
                'customerId' => $customerId,
                'exportType' => 'docx'
            ));
            
            // Send response
            wp_send_json_success(array(
                'message' => 'Tài liệu đã được tạo thành công',
                'downloadUrl' => $document['blobUrl'],
                'filename' => $document['filename']
            ));
            
        } catch (Exception $e) {
            wp_send_json_error(array(
                'message' => 'Lỗi tạo tài liệu: ' . $e->getMessage()
            ));
        }
    }
    
    public function renderDocumentForm($atts) {
        $templates = $this->getTemplates();
        
        ob_start();
        ?>
        <form id="crm-document-form">
            <div class="form-group">
                <label>Chọn loại tài liệu:</label>
                <select name="template_id" required>
                    <?php foreach ($templates as $template): ?>
                        <option value="<?php echo $template['template_id']; ?>">
                            <?php echo esc_html($template['template_name']); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            
            <div class="form-group">
                <label>Họ tên:</label>
                <input type="text" name="full_name" required>
            </div>
            
            <div class="form-group">
                <label>Số điện thoại:</label>
                <input type="tel" name="phone" required>
            </div>
            
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label>Địa chỉ:</label>
                <textarea name="address" required></textarea>
            </div>
            
            <button type="submit">Tạo tài liệu</button>
            <div id="result"></div>
        </form>
        
        <script>
        jQuery(document).ready(function($) {
            $('#crm-document-form').on('submit', function(e) {
                e.preventDefault();
                
                var formData = $(this).serialize();
                formData += '&action=generate_document';
                formData += '&nonce=<?php echo wp_create_nonce("crm_document_nonce"); ?>';
                
                $.post(ajaxurl, formData, function(response) {
                    if (response.success) {
                        $('#result').html(
                            '<p>Thành công! <a href="' + response.data.downloadUrl + '" target="_blank">Tải tài liệu</a></p>'
                        );
                    } else {
                        $('#result').html('<p style="color: red;">Lỗi: ' + response.data.message + '</p>');
                    }
                });
            });
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    private function callCRMAPI($endpoint, $method = 'GET', $data = null) {
        $url = $this->apiBase . $endpoint;
        
        $args = array(
            'method' => $method,
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/json'
            )
        );
        
        if ($data && $method !== 'GET') {
            $args['body'] = json_encode($data);
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            throw new Exception($response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (wp_remote_retrieve_response_code($response) >= 400) {
            throw new Exception($data['error'] ?? 'API Error');
        }
        
        return $data;
    }
}

new CRMDocumentPlugin();
?>
```

---

## 5. ⚡ Microservice Architecture

### 5.1 Document Service Wrapper
```javascript
// document-microservice.js
const express = require('express');
const Redis = require('redis');
const Bull = require('bull');

class DocumentMicroservice {
  constructor() {
    this.app = express();
    this.redis = Redis.createClient();
    this.documentQueue = new Bull('document generation', {
      redis: { host: 'localhost', port: 6379 }
    });
    
    this.crmApi = 'https://crm.titi.io.vn/api';
    this.setupMiddleware();
    this.setupRoutes();
    this.setupQueue();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting
    const rateLimit = require('express-rate-limit');
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Async document generation
    this.app.post('/generate', async (req, res) => {
      try {
        const job = await this.documentQueue.add('generate', req.body, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        });

        res.json({
          success: true,
          jobId: job.id,
          status: 'queued',
          statusUrl: `/status/${job.id}`
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Check job status
    this.app.get('/status/:jobId', async (req, res) => {
      try {
        const job = await this.documentQueue.getJob(req.params.jobId);
        
        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        const progress = job.progress();
        const result = job.returnvalue;

        res.json({
          jobId: job.id,
          state,
          progress,
          result: state === 'completed' ? result : null,
          createdAt: new Date(job.timestamp),
          processedAt: job.processedOn ? new Date(job.processedOn) : null
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Batch generation
    this.app.post('/batch', async (req, res) => {
      try {
        const { requests } = req.body;
        const jobs = [];

        for (const request of requests) {
          const job = await this.documentQueue.add('generate', request, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 }
          });
          jobs.push({ requestId: request.requestId, jobId: job.id });
        }

        res.json({
          success: true,
          batchId: Date.now(),
          jobs,
          statusUrl: '/batch-status'
        });

      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  setupQueue() {
    this.documentQueue.process('generate', async (job) => {
      const { templateId, customerId, exportType, callbackUrl } = job.data;

      try {
        // Update progress
        job.progress(20);

        // Call CRM API
        const response = await axios.post(
          `${this.crmApi}/documents?return=json`,
          { templateId, customerId, exportType }
        );

        job.progress(80);

        const result = {
          success: true,
          filename: response.data.filename,
          downloadUrl: response.data.blobUrl,
          fileSize: response.data.fileSize,
          generatedAt: new Date().toISOString()
        };

        // Callback if provided
        if (callbackUrl) {
          await axios.post(callbackUrl, result).catch(console.error);
        }

        job.progress(100);
        return result;

      } catch (error) {
        // Callback with error
        if (job.data.callbackUrl) {
          await axios.post(job.data.callbackUrl, {
            success: false,
            error: error.message
          }).catch(console.error);
        }

        throw error;
      }
    });

    // Event handlers
    this.documentQueue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed:`, result);
    });

    this.documentQueue.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed:`, error.message);
    });
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`Document Microservice running on port ${port}`);
    });
  }
}

// Usage
const service = new DocumentMicroservice();
service.start();

// Client usage example
/*
// Async generation with callback
const response = await fetch('http://localhost:3001/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 6,
    customerId: 1,
    exportType: 'docx',
    callbackUrl: 'https://your-system.com/webhook/document-ready'
  })
});

const { jobId, statusUrl } = await response.json();

// Check status later
const statusResponse = await fetch(`http://localhost:3001${statusUrl}`);
const status = await statusResponse.json();
*/
```

---

## 🎯 Kết Luận

Các ví dụ tích hợp trên cho thấy Document API có thể dễ dàng tích hợp với:

✅ **Hệ thống Core Banking** - Tự động tạo hợp đồng khi loan được approve
✅ **CRM/ERP Enterprise** - Sync với Salesforce, SAP
✅ **Mobile Applications** - Offline-ready với queue system  
✅ **Website/Portal** - WordPress plugin, web forms
✅ **Microservice Architecture** - Async processing với Redis Queue

**Key Benefits**:
- 🚀 **Flexible Integration**: REST API dễ tích hợp
- ⚡ **High Performance**: Async processing, caching, rate limiting
- 🛡️ **Reliable**: Error handling, retry logic, offline support
- 📊 **Scalable**: Queue system, batch processing
- 🔒 **Secure**: Authentication, input validation

Document API đã sẵn sàng cho production deployment và có thể scale theo nhu cầu của doanh nghiệp!
