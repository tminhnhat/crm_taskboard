"use client";
import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';

export default function TemplatesDashboard() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (response.ok) {
          setTemplates(data.templates || []);
        } else {
          console.error('Error fetching templates:', data.error);
          setTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      }
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    const documentType = (form.elements.namedItem('documentType') as HTMLSelectElement).value;
    
    if (!file) {
      alert('Vui lòng chọn file template');
      return;
    }
    
    setUploading(true);
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append('template', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('Upload template thành công!');
        // Refetch list từ API
        const listResponse = await fetch('/api/templates');
        const listData = await listResponse.json();
        if (listResponse.ok) {
          setTemplates(listData.templates || []);
        }
        // Clear form
        if (fileRef.current) fileRef.current.value = '';
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload thất bại: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Quản lý Template</h1>
  <Navigation />
      <div className="mb-6">
        <form className="flex gap-2 items-center" onSubmit={handleUpload}>
          <input 
            ref={fileRef} 
            type="file" 
            name="template" 
            accept=".docx,.doc" 
            className="border p-2 rounded" 
            required
          />
          <select 
            name="documentType" 
            className="border p-2 rounded"
            required
          >
            <option value="">-- Chọn loại tài liệu --</option>
            <option value="hop_dong_tin_dung">Hợp đồng tín dụng</option>
            <option value="to_trinh_tham_dinh">Tờ trình thẩm định</option>
            <option value="giay_de_nghi_vay_von">Giấy đề nghị vay vốn</option>
            <option value="bien_ban_dinh_gia">Biên bản định giá</option>
            <option value="hop_dong_the_chap">Hợp đồng thế chấp</option>
          </select>
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" 
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : 'Upload Template'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Danh sách Template</h2>
        {loading ? <div>Đang tải...</div> : (
          <ul className="divide-y">
            {templates.length === 0 && <li className="py-2 text-gray-500">Chưa có template nào.</li>}
            {templates.map((tpl, idx) => (
              <li key={idx} className="py-2 flex justify-between items-center">
                <span>{tpl.name || tpl}</span>
                <button
                  className="text-red-500 hover:underline"
                  onClick={async () => {
                    if (!window.confirm('Bạn chắc chắn muốn xóa template này?')) return;
                    try {
                      const res = await fetch(`/api/templates?file=maubieu/${encodeURIComponent(tpl)}`, { method: 'DELETE' });
                      const data = await res.json();
                      if (res.ok) {
                        // Refetch list từ API
                        const response = await fetch('/api/templates');
                        const refreshData = await response.json();
                        if (response.ok) {
                          setTemplates(refreshData.templates || []);
                        }
                        alert('Đã xóa template!');
                      } else {
                        alert(data.error || 'Xóa thất bại');
                      }
                    } catch {
                      alert('Lỗi xóa template');
                    }
                  }}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
