'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  LinearProgress,
  useTheme,
  Skeleton
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon,
  FileCopy as FileCopyIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useDocuments } from '@/hooks/useDocuments';
import type { DocumentTemplate } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface TemplateManagerProps {
  templateType?: string;
  onTemplateSelect?: (template: DocumentTemplate) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

export function TemplateManager({ 
  templateType, 
  onTemplateSelect, 
  allowUpload = true, 
  allowDelete = true 
}: TemplateManagerProps) {
  const theme = useTheme();
  const { 
    templates, 
    loading, 
    error, 
    fetchTemplates, 
    uploadTemplate, 
    deleteTemplateFile 
  } = useDocuments();

  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState(templateType || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<DocumentTemplate | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchTemplates(templateType);
  }, [fetchTemplates, templateType]);

  const templateTypeOptions = [
    { value: 'hop_dong_tin_dung', label: 'Hợp đồng tín dụng' },
    { value: 'to_trinh_tham_dinh', label: 'Tờ trình thẩm định' },
    { value: 'giay_de_nghi_vay_von', label: 'Giấy đề nghị vay vốn' },
    { value: 'bien_ban_dinh_gia', label: 'Biên bản định giá' },
    { value: 'hop_dong_the_chap', label: 'Hợp đồng thế chấp' },
    { value: 'don_dang_ky_the_chap', label: 'Đơn đăng ký thế chấp' },
    { value: 'hop_dong_thu_phi', label: 'Hợp đồng thu phí' },
    { value: 'tai_lieu_khac', label: 'Tài liệu khác' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill template name from filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setNewTemplateName(nameWithoutExt);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newTemplateName || !newTemplateType) {
      alert('Vui lòng chọn file, nhập tên template và loại template');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadTemplate(selectedFile, newTemplateName, newTemplateType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setSelectedFile(null);
      setNewTemplateName('');
      if (!templateType) setNewTemplateType('');
      setUploadProgress(0);
      
      // Reset file input
      const fileInput = document.getElementById('template-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      alert('Upload template thành công!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload template thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (template: DocumentTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplateFile(templateToDelete);
      alert('Xóa template thành công!');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Xóa template thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'docx':
      case 'doc':
        return <DescriptionIcon />;
      case 'xlsx':
      case 'xls':
        return <TableChartIcon />;
      default:
        return <FileCopyIcon />;
    }
  };

  const getFileTypeColor = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'docx':
      case 'doc':
        return 'primary';
      case 'xlsx':
      case 'xls':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && templates.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Box key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33%', lg: '25%' }, p: 1 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="rectangular" width="100%" height={60} />
                  <Skeleton variant="text" sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rounded" width={80} height={32} />
                    <Skeleton variant="rounded" width={80} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Grid>
      </Container>
    );
  }

  const docxCount = templates.filter(t => t.file_url.includes('.docx')).length;
  const xlsxCount = templates.filter(t => t.file_url.includes('.xlsx')).length;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'grey.50',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: 'background.paper', borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
              📄 Template Manager
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Quản lý templates cho tất cả loại tài liệu {templateType ? `- ${templateType}` : ''}
            </Typography>
            <Box sx={{ 
              width: 120, 
              height: 4, 
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', 
              borderRadius: 2, 
              mx: 'auto' 
            }} />
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ width: { xs: '100%', sm: '33%' }, p: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'primary.50',
                    color: 'primary.main'
                  }}>
                    <FolderIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {templates.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng Templates
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '33%' }, p: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'success.50',
                    color: 'success.main'
                  }}>
                    <DescriptionIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color="success.main">
                  {docxCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DOCX Templates
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ width: { xs: '100%', sm: '33%' }, p: 1 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'warning.50',
                    color: 'warning.main'
                  }}>
                    <TableChartIcon fontSize="large" />
                  </Box>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold" color="warning.main">
                  {xlsxCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  XLSX Templates
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Upload Section */}
        {allowUpload && (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                  mr: 2
                }}>
                  <CloudUploadIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Upload Template Mới
                  </Typography>
                  <Typography color="text.secondary">
                    Thêm template DOCX hoặc XLSX mới vào hệ thống
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* File Upload */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        📎 Chọn File Template
                      </Typography>
                      <input
                        id="template-file"
                        type="file"
                        accept=".docx,.xlsx,.doc,.xls"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="template-file">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          sx={{ 
                            py: 2,
                            borderStyle: 'dashed',
                            '&:hover': {
                              borderStyle: 'dashed'
                            }
                          }}
                        >
                          Chọn file (.docx, .xlsx)
                        </Button>
                      </label>
                      {selectedFile && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mt: 1,
                          p: 1,
                          bgcolor: 'success.50',
                          borderRadius: 1
                        }}>
                          <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} fontSize="small" />
                          <Typography variant="body2" color="success.dark">
                            {selectedFile.name}
                          </Typography>
                        </Box>
                      )}
                      
                      {uploadLoading && (
                        <Box sx={{ mt: 2 }}>
                          <LinearProgress variant="determinate" value={uploadProgress} />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            Đang upload... {uploadProgress}%
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Template Name */}
                    <TextField
                      label="Tên Template"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Nhập tên mô tả cho template..."
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            🏷️
                          </Box>
                        ),
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ width: { xs: '100%', md: '50%' }, p: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                    {/* Template Type */}
                    <TextField
                      label="Loại Template"
                      value={newTemplateType}
                      onChange={(e) => setNewTemplateType(e.target.value)}
                      select
                      fullWidth
                      variant="outlined"
                      disabled={!!templateType}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            📂
                          </Box>
                        ),
                      }}
                    >
                      <MenuItem value="">Chọn loại template...</MenuItem>
                      {templateTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Upload Button */}
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        onClick={handleUpload}
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={uploadLoading || !selectedFile || !newTemplateName || !newTemplateType}
                        startIcon={uploadLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        sx={{ py: 1.5 }}
                      >
                        {uploadLoading ? 'Đang upload...' : '🚀 Upload Template'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'secondary.50',
                  color: 'secondary.main',
                  mr: 2
                }}>
                  <FileCopyIcon />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Danh sách Templates
                  </Typography>
                  <Typography color="text.secondary">
                    {templates.length} templates có sẵn
                  </Typography>
                </Box>
              </Box>
              
              {loading && (
                <CircularProgress size={24} />
              )}
            </Box>

            {templates.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'grey.100', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <FileCopyIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chưa có template nào
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  {allowUpload ? 'Hãy upload template đầu tiên để bắt đầu sử dụng.' : 'Liên hệ admin để thêm templates.'}
                </Typography>
                {allowUpload && (
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => document.getElementById('template-file')?.click()}
                  >
                    Upload Template Đầu Tiên
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  sm: 'repeat(2, 1fr)', 
                  md: 'repeat(3, 1fr)', 
                  lg: 'repeat(4, 1fr)' 
                }, 
                gap: 3
              }}>
                {templates.map((template) => {
                  const fileExtension = template.file_url.split('.').pop()?.toLowerCase() || '';
                  const fileIcon = getFileIcon(template.file_url);
                  const fileTypeColor = getFileTypeColor(template.file_url);
                  
                  return (
                    <Card key={template.template_id} sx={{ 
                      height: '100%',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8]
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* File Icon and Type */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ 
                            p: 1.5, 
                            borderRadius: 2, 
                            bgcolor: `${fileTypeColor}.50`,
                            color: `${fileTypeColor}.main`
                          }}>
                            {fileIcon}
                          </Box>
                          <Chip 
                            label={fileExtension.toUpperCase()} 
                            color={fileTypeColor as any}
                            size="small"
                          />
                        </Box>

                        {/* Template Info */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, lineHeight: 1.3 }}>
                          {template.template_name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FolderIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Chip 
                              label={template.template_type} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(template.created_at)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            href={template.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<DownloadIcon />}
                            sx={{ flex: 1 }}
                          >
                            Tải về
                          </Button>
                          
                          {onTemplateSelect && (
                            <Button
                              onClick={() => onTemplateSelect(template)}
                              variant="contained"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              sx={{ flex: 1 }}
                            >
                              Chọn
                            </Button>
                          )}
                        </Box>

                        {/* Delete Button */}
                        {allowDelete && (
                          <Tooltip title="Xóa template">
                            <IconButton
                              onClick={() => handleDeleteClick(template)}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'error.main',
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': {
                                  bgcolor: 'error.50'
                                }
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          Xác nhận xóa template
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa template "{templateToDelete?.template_name}"?
            <br />
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
