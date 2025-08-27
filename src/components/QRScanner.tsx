import React, { useRef, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
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
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return setError('Không thể đọc ảnh');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);
      if (code && code.data) {
        const parsed = parseVNIDQR(code.data);
        if (parsed) {
          onResult(parsed);
        } else {
          setError('QR không hợp lệ hoặc không đúng định dạng CCCD Việt Nam');
        }
      } else {
        setError('Không tìm thấy mã QR trong ảnh');
      }
    };
    img.onerror = () => setError('Không thể tải ảnh');
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startCameraScan}
        disabled={scanning}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {scanning ? 'Đang quét...' : 'Quét QR bằng Camera'}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="block mt-2"
      />
      <video ref={videoRef} style={{ width: 320, height: 240, display: scanning ? 'block' : 'none' }} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </div>
  );
}
