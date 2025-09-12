import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  PhotoCamera as PhotoIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/browser';
import NotFoundException from '@zxing/library';
import jsQR from 'jsqr';

interface QRScanResult {
  id_number: string;
  id_issue_number: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  address: string;
  id_issue_date: string;
}

interface QRScannerProps {
  onResult: (data: QRScanResult) => void;
}

export default function QRScanner({ onResult }: QRScannerProps) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse QR code data from Vietnam ID card QR
  function parseVNIDQR(raw: string): QRScanResult | null {
    // Example: 048090005397|201578508|Trần Minh Nhật|27031990|Nam|K85/18 Hàn Mặc Tử, Tổ 22, Thuận Phước, Hải Châu, Đà Nẵng|27082021
    const parts = raw.split('|');
    if (parts.length < 7) return null;
    return {
      id_number: parts[0],
      id_issue_number: parts[1],
      full_name: parts[2],
      date_of_birth: parts[3],
      gender: parts[4],
      address: parts[5],
      id_issue_date: parts[6],
    };
  }

  // Scan from camera
  const startCameraScan = async () => {
    setError(null);
    setScanning(true);
    try {
      const codeReader = new BrowserMultiFormatReader();
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      if (!selectedDeviceId) throw new Error('Không tìm thấy camera');
      const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current!);
      const parsed = parseVNIDQR(result.getText());
      if (parsed) {
        onResult(parsed);
      } else {
        setError('QR không hợp lệ hoặc không đúng định dạng CCCD Việt Nam');
      }
      // Stop the video stream after scan
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (err: any) {
      // NotFoundException is a class, but may not always be instance of, so check by name
      if (!(err && err.name === 'NotFoundException')) {
        setError('Không thể quét QR: ' + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setScanning(false);
    }
  };

  // Scan from uploaded image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setProcessingFile(true);
    const file = e.target.files?.[0];
    if (!file) {
      setProcessingFile(false);
      return;
    }
    
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Không thể đọc ảnh');
          setProcessingFile(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Enhance image: grayscale and increase contrast
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // Increase contrast
          const contrast = 1.5;
          const contrasted = (avg - 128) * contrast + 128;
          data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, contrasted));
        }
        ctx.putImageData(imageData, 0, 0);
        imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Try jsQR first
        let code = jsQR(imageData.data, img.width, img.height);
        if (code && code.data) {
          const parsed = parseVNIDQR(code.data);
          if (parsed) {
            onResult(parsed);
            setProcessingFile(false);
            return;
          }
        }

        // Fallback: try ZXing decodeFromCanvas
        try {
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromCanvas(canvas);
          if (result && result.getText()) {
            const parsed = parseVNIDQR(result.getText());
            if (parsed) {
              onResult(parsed);
              setProcessingFile(false);
              return;
            }
          }
        } catch (err) {
          // ignore, will show error below
        }

        setError('Không tìm thấy mã QR trong ảnh hoặc ảnh không rõ nét. Hãy thử lại với ảnh rõ hơn.');
      } finally {
        setProcessingFile(false);
        URL.revokeObjectURL(img.src);
      }
    };
    img.onerror = () => {
      setError('Không thể tải ảnh');
      setProcessingFile(false);
      URL.revokeObjectURL(img.src);
    };
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <QrCodeScannerIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="600">
            Quét QR Code CCCD
          </Typography>
        </Box>

        <Stack spacing={2}>
          {/* Camera Scan Button */}
          <Button
            variant="contained"
            startIcon={scanning ? <CircularProgress size={20} color="inherit" /> : <CameraIcon />}
            onClick={startCameraScan}
            disabled={scanning || processingFile}
            size="large"
            fullWidth
          >
            {scanning ? 'Đang quét...' : 'Quét QR bằng Camera'}
          </Button>

          {/* File Upload Button */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={processingFile ? <CircularProgress size={20} /> : <PhotoIcon />}
            onClick={handleUploadClick}
            disabled={scanning || processingFile}
            size="large"
            fullWidth
          >
            {processingFile ? 'Đang xử lý...' : 'Tải ảnh từ thiết bị'}
          </Button>

          {/* Video Preview */}
          {scanning && (
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                bgcolor: 'grey.900',
                borderRadius: 2
              }}
            >
              <video 
                ref={videoRef} 
                style={{ 
                  width: '100%',
                  maxWidth: '320px',
                  height: 'auto',
                  borderRadius: theme.shape.borderRadius
                }} 
              />
              <Typography variant="body2" color="white" sx={{ mt: 1 }}>
                Đưa QR code CCCD vào khung hình
              </Typography>
            </Paper>
          )}

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Instructions */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Hướng dẫn:</strong>
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Đảm bảo QR code rõ nét và đầy đủ</li>
              <li>Tránh bóng đổ và phản chiếu ánh sáng</li>
              <li>Chỉ hỗ trợ QR code trên CCCD Việt Nam</li>
            </ul>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
}
