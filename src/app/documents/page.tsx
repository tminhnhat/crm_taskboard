'use client';

import { useState, Suspense, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Add,
  Settings,
  Download,
  Email,
  Delete,
  Description,
  CheckCircle,
  OpenInNew,
  Close,
  Refresh
} from '@mui/icons-material';
import Navigation from '@/components/Navigation';
import { useSearchParams } from 'next/navigation';
import { useDocuments } from '@/hooks/useDocuments';
import { useCustomers } from '@/hooks/useCustomers';
import { useCollaterals } from '@/hooks/useCollaterals';
import useCreditAssessments from '@/hooks/useCreditAssessments';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DocumentGenerationForm {
  templateId: number | '';
  customerId: string;
  collateralId?: string;
  assessmentId?: string;
  exportType: 'docx' | 'xlsx';
  sendViaEmail?: boolean;
  emailAddress?: string;
}

// Component that uses useSearchParams - must be wrapped in Suspense
function DocumentsContent() {
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showSendmailModal, setShowSendmailModal] = useState(false);
  const [selectedDocumentForEmail, setSelectedDocumentForEmail] = useState<any>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = useTheme();
  
  // Lấy danh sách template metadata từ Supabase
  const { 
    documents, 
    loading: documentsLoading, 
    error: documentsError, 
    generateDocument, 
    downloadDocument,
    deleteDocument, 
    fetchDocuments,
    sendDocumentByEmail,
    templates,
    fetchTemplates
  } = useDocuments();
  const [formData, setFormData] = useState<DocumentGenerationForm>({
    templateId: '',
    customerId: '',
    collateralId: '',
    assessmentId: '',
    exportType: 'docx',
    sendViaEmail: false,
    emailAddress: ''
  });

  // ...existing code...
  
  const { customers, refetch: fetchCustomers } = useCustomers();
  const { collaterals, refetch: fetchCollaterals } = useCollaterals();
  const { fetchAssessments } = useCreditAssessments();
  
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [collateralsList, setCollateralsList] = useState<any[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<any[]>([]);

  const searchParams = useSearchParams();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCustomers(),
          fetchCollaterals()
        ]);
        
        const assessmentsData = await fetchAssessments();
        setAssessmentsList(assessmentsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Load available templates
  // Refetch templates on mount
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  
  // Update local state when hook data changes
  useEffect(() => {
    setCustomersList(customers || []);
  }, [customers]);
  
  useEffect(() => {
    setCollateralsList(collaterals || []);
  }, [collaterals]);

  // Load available templates
  // Refetch templates on mount
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Kiểm tra template khả dụng dựa trên template_type
  const getDocumentTypeWithTemplate = (type: any) => {
    const hasTemplate = templates.some(tpl => tpl.template_type === type.value);
    return {
      ...type,
      hasTemplate,
      displayLabel: hasTemplate ? type.label : `${type.label} (Chưa có mẫu)`
    };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId || !formData.customerId) {
      alert('Vui lòng chọn template và khách hàng');
      return;
    }

    if (formData.sendViaEmail && !formData.emailAddress) {
      alert('Vui lòng nhập địa chỉ email để gửi tài liệu');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDocument({
        templateId: Number(formData.templateId),
        customerId: parseInt(formData.customerId),
        collateralId: formData.collateralId ? parseInt(formData.collateralId) : undefined,
        assessmentId: formData.assessmentId ? parseInt(formData.assessmentId) : undefined,
        exportType: formData.exportType
      });
      // Debug: show document generation result in browser console
      console.log('Document generation result:', result);
      
      // If user wants to send via email, send it
      if (formData.sendViaEmail && formData.emailAddress) {
        try {
          await sendDocumentByEmail(result.filename, formData.emailAddress);
          alert('Tạo tài liệu và gửi email thành công!');
        } catch (emailError) {
          alert(`Tạo tài liệu thành công nhưng gửi email thất bại: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        }
      } else {
        alert(`Tạo tài liệu thành công!\nFile: ${result.filename}`);
      }
      
      setShowGenerateForm(false);
      setFormData({
        templateId: '',
        customerId: '',
        collateralId: '',
        assessmentId: '',
        exportType: 'docx',
        sendViaEmail: false,
        emailAddress: ''
      });
    } catch (error) {
      alert(`Lỗi tạo tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      if (document.file_url && document.file_url.startsWith('http')) {
        // For blob URLs, open directly
        window.open(document.file_url, '_blank');
      } else {
        // For legacy documents without blob URLs, show error message
        alert('Tài liệu này chưa có liên kết tải xuống. Vui lòng tạo lại tài liệu.');
      }
    } catch (error) {
      alert(`Lỗi tải tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    
    try {
      await deleteDocument(documentId);
      alert('Xóa tài liệu thành công!');
    } catch (error) {
      alert(`Lỗi xóa tài liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendmail = (document: any) => {
    setSelectedDocumentForEmail(document);
    // Pre-fill email if customer has email
    if (document.customer?.email) {
      setEmailAddress(document.customer.email);
    } else {
      setEmailAddress('');
    }
    setShowSendmailModal(true);
  };

  const handleSendmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentForEmail || !emailAddress) return;

    setIsSending(true);
    try {
      console.log('Sending email for document:', selectedDocumentForEmail);
      console.log('File name:', selectedDocumentForEmail.file_name);
      console.log('Email address:', emailAddress);
      
      if (!selectedDocumentForEmail.file_name) {
        throw new Error('Document file name is missing');
      }
      
      await sendDocumentByEmail(selectedDocumentForEmail.file_name, emailAddress);
      alert('Gửi email thành công!');
      setShowSendmailModal(false);
      setSelectedDocumentForEmail(null);
      setEmailAddress('');
    } catch (error) {
      console.error('Email sending error:', error);
      alert(`Lỗi gửi email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    // Simple mapping for common document types
    const typeLabels: Record<string, string> = {
      'hop_dong_tin_dung': 'Hợp đồng tín dụng',
      'to_trinh_tham_dinh': 'Tờ trình thẩm định',
      'giay_de_nghi_vay_von': 'Giấy đề nghị vay vốn',
      'bien_ban_dinh_gia': 'Biên bản định giá',
      'hop_dong_the_chap': 'Hợp đồng thế chấp',
      'don_dang_ky_the_chap': 'Đơn đăng ký thế chấp',
      'hop_dong_thu_phi': 'Hợp đồng thu phí',
      'tai_lieu_khac': 'Tài liệu khác'
    };
    return typeLabels[type] || type;
  };


  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quản lý Tài liệu
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tạo và quản lý tài liệu cho khách hàng, tài sản đảm bảo và thẩm định tín dụng.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              href="/templates"
              sx={{ borderRadius: 2 }}
            >
              Quản lý Templates
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowGenerateForm(true)}
              sx={{ borderRadius: 2 }}
            >
              Tạo Tài liệu Mới
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Template Status Overview */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tình trạng Templates
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(
            templates.reduce((acc, template) => {
              const type = template.template_type;
              if (!acc[type]) {
                acc[type] = [];
              }
              acc[type].push(template);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([type, templatesForType]) => (
            <Grid key={type} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderColor: 'success.light',
                  backgroundColor: 'success.50',
                  borderWidth: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {getDocumentTypeLabel(type)}
                  </Typography>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                </Box>
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  {templatesForType.length} template{templatesForType.length > 1 ? 's' : ''}
                </Typography>
              </Card>
            </Grid>
          ))}
          
          {templates.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Chưa có template nào
                </Typography>
                <Button
                  variant="outlined"
                  href="/templates"
                  sx={{ mt: 1 }}
                >
                  Tải lên template đầu tiên →
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {templates.length} template{templates.length !== 1 ? 's' : ''} có sẵn cho {Object.keys(templates.reduce((acc, t) => ({...acc, [t.template_type]: true}), {})).length} loại tài liệu
          </Typography>
          <Button size="small" href="/templates">
            Quản lý templates →
          </Button>
        </Box>
      </Card>

      {documentsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {documentsError}
        </Alert>
      )}

      {/* Generate Document Dialog */}
      <Dialog
        open={showGenerateForm}
        onClose={() => setShowGenerateForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Tạo Tài liệu Mới
            <IconButton onClick={() => setShowGenerateForm(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Template Selection */}
              <FormControl fullWidth required>
                <InputLabel>Template</InputLabel>
                <Select
                  value={formData.templateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value as any }))}
                  label="Template"
                >
                  <MenuItem value="">-- Chọn template --</MenuItem>
                  {templates.map(template => (
                    <MenuItem key={template.template_id} value={template.template_id}>
                      {template.template_name} ({template.template_type})
                    </MenuItem>
                  ))}
                </Select>
                {templates.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Chưa có template nào. <Button size="small" href="/templates">Tải lên template</Button>
                  </Typography>
                )}
                {formData.templateId && (
                  <Card variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                    {(() => {
                      const selectedTemplate = templates.find(t => t.template_id === Number(formData.templateId));
                      if (selectedTemplate) {
                        return (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mb: 1 }}>
                              <CheckCircle sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">Template đã chọn:</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">{selectedTemplate.template_name}</Typography>
                              <Button
                                size="small"
                                startIcon={<OpenInNew />}
                                href={selectedTemplate.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Xem template
                              </Button>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Loại: {selectedTemplate.template_type}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    })()}
                  </Card>
                )}
              </FormControl>

              {/* Customer Selection */}
              <FormControl fullWidth required>
                <InputLabel>Khách hàng</InputLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  label="Khách hàng"
                >
                  <MenuItem value="">-- Chọn khách hàng --</MenuItem>
                  {customersList.map((customer: any) => (
                    <MenuItem key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name} ({customer.id_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Collateral Selection */}
              <FormControl fullWidth>
                <InputLabel>Tài sản đảm bảo (tùy chọn)</InputLabel>
                <Select
                  value={formData.collateralId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, collateralId: e.target.value }))}
                  label="Tài sản đảm bảo (tùy chọn)"
                >
                  <MenuItem value="">-- Không chọn --</MenuItem>
                  {collateralsList.map((collateral: any) => (
                    <MenuItem key={collateral.collateral_id} value={collateral.collateral_id}>
                      {collateral.collateral_type} - {collateral.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Assessment Selection */}
              <FormControl fullWidth>
                <InputLabel>Thẩm định tín dụng (tùy chọn)</InputLabel>
                <Select
                  value={formData.assessmentId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assessmentId: e.target.value }))}
                  label="Thẩm định tín dụng (tùy chọn)"
                >
                  <MenuItem value="">-- Không chọn --</MenuItem>
                  {assessmentsList.map((assessment: any) => (
                    <MenuItem key={assessment.assessment_id} value={assessment.assessment_id}>
                      {assessment.customer?.full_name} - {assessment.status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Export Type */}
              <FormControl fullWidth>
                <InputLabel>Định dạng</InputLabel>
                <Select
                  value={formData.exportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, exportType: e.target.value as 'docx' | 'xlsx' }))}
                  label="Định dạng"
                >
                  <MenuItem value="docx">Word (.docx)</MenuItem>
                  <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Hỗ trợ tạo file Word (.docx) và Excel (.xlsx) từ template
                </Typography>
              </FormControl>

              {/* Email Options */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.sendViaEmail || false}
                    onChange={(e) => {
                      const sendViaEmail = e.target.checked;
                      setFormData(prev => ({ 
                        ...prev, 
                        sendViaEmail,
                        emailAddress: sendViaEmail ? (
                          customersList.find(c => c.customer_id === parseInt(formData.customerId))?.email || ''
                        ) : ''
                      }));
                    }}
                  />
                }
                label="Gửi tài liệu qua email"
              />

              {formData.sendViaEmail && (
                <TextField
                  fullWidth
                  type="email"
                  label="Địa chỉ email người nhận"
                  value={formData.emailAddress || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                  placeholder="example@email.com"
                  required={formData.sendViaEmail}
                  helperText="Email sẽ được gửi sau khi tạo tài liệu thành công"
                />
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setShowGenerateForm(false)} color="inherit">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={16} /> : undefined}
            >
              {isGenerating ? 'Đang tạo...' : (formData.sendViaEmail ? 'Tạo & Gửi Email' : 'Tạo Tài liệu')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog
        open={showSendmailModal}
        onClose={() => {
          setShowSendmailModal(false);
          setSelectedDocumentForEmail(null);
          setEmailAddress('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Gửi Tài liệu qua Email
            <IconButton
              onClick={() => {
                setShowSendmailModal(false);
                setSelectedDocumentForEmail(null);
                setEmailAddress('');
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        {selectedDocumentForEmail && (
          <form onSubmit={handleSendmailSubmit}>
            <DialogContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>Thông tin tài liệu:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Loại:</strong> {getDocumentTypeLabel(selectedDocumentForEmail.document_type)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tên file:</strong> {selectedDocumentForEmail.file_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Khách hàng:</strong> {selectedDocumentForEmail.customer?.full_name}
                  </Typography>
                </Card>

                <TextField
                  fullWidth
                  type="email"
                  label="Địa chỉ email người nhận"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="example@email.com"
                  required
                  helperText={selectedDocumentForEmail.customer?.email ? 
                    "Email mặc định từ thông tin khách hàng" : undefined}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button
                onClick={() => {
                  setShowSendmailModal(false);
                  setSelectedDocumentForEmail(null);
                  setEmailAddress('');
                }}
                color="inherit"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSending || !emailAddress}
                startIcon={isSending ? <CircularProgress size={16} /> : <Email />}
              >
                {isSending ? 'Đang gửi...' : 'Gửi Email'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Documents List */}
      <Card>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Tài liệu đã tạo</Typography>
        </Box>

        {documentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <LoadingSpinner message="Đang tải tài liệu..." />
          </Box>
        ) : documents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Chưa có tài liệu nào</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Bắt đầu bằng cách tạo tài liệu đầu tiên
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowGenerateForm(true)}
            >
              Tạo Tài liệu Mới
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loại Tài liệu</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Tên File</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.document_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: 'primary.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Description sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {getDocumentTypeLabel(doc.document_type)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{doc.customer?.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.customer?.id_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{doc.file_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.file_name.endsWith('.docx') ? 'Word' : doc.file_name.endsWith('.xlsx') ? 'Excel' : 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const templatesForType = templates.filter(tpl => tpl.template_type === doc.document_type);
                        if (templatesForType.length > 0) {
                          return (
                            <Box>
                              {templatesForType.slice(0, 1).map(template => (
                                <Box key={template.template_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color="success.main">
                                    {template.template_name}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    href={template.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <OpenInNew sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Box>
                              ))}
                              {templatesForType.length > 1 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{templatesForType.length - 1} template khác
                                </Typography>
                              )}
                            </Box>
                          );
                        } else {
                          return (
                            <Typography variant="body2" color="text.secondary">Không có template</Typography>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(doc.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          onClick={() => handleDownload(doc)}
                        >
                          Tải xuống
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<Email />}
                          onClick={() => handleSendmail(doc)}
                        >
                          Gửi email
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(doc.document_id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Đang tải trang quản lý tài liệu..." />}>
  <Navigation />
      <DocumentsContent />
    </Suspense>
  );
}
