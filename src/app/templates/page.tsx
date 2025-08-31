"use client";
import React, { useRef, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useDocuments } from '@/hooks/useDocuments';

export default function TemplatesDashboard() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [uploading, setUploading] = useState(false);
  const { templates, loading, error, fetchTemplates, addTemplate, deleteTemplate } = useDocuments();

  // Refetch templates on mount
  React.useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      alert('Vui lòng chọn file template');
      return;
    }
    if (!templateName || !templateType) {
      alert('Vui lòng nhập tên và loại template');
      return;
    }
    setUploading(true);
    try {
      // Upload file lên storage (giả định đã có API hoặc upload lên Supabase Storage, ở đây chỉ demo lưu URL tạm)
      // TODO: Thay thế đoạn này bằng upload thực tế nếu có
      const fakeUrl = URL.createObjectURL(file);
      await addTemplate({
        template_name: templateName,
        template_type: templateType,
        file_url: fakeUrl,
      });
      setTemplateName('');
      setTemplateType('');
      if (fileRef.current) fileRef.current.value = '';
      alert('Thêm template thành công!');
    } catch (err: any) {
      alert('Thêm template thất bại: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploading(false);
      fetchTemplates();
    }
  }

  return (
    <>
      <Navigation />
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Quản lý Template</h1>
        <div className="mb-6">
          <form className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center" onSubmit={handleUpload}>
            <input
              ref={fileRef}
              type="file"
              name="template"
              accept=".docx,.doc"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="templateName"
              placeholder="Tên template"
              className="border p-2 rounded"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              required
            />
            <input
              type="text"
              name="templateType"
              placeholder="Loại template (ví dụ: hop_dong_tin_dung)"
              className="border p-2 rounded"
              value={templateType}
              onChange={e => setTemplateType(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? 'Đang upload...' : 'Thêm Template'}
            </button>
          </form>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Danh sách Template</h2>
          {loading ? <div>Đang tải...</div> : (
            <ul className="divide-y">
              {templates.length === 0 && <li className="py-2 text-gray-500">Chưa có template nào.</li>}
              {templates.map((tpl, idx) => (
                <li key={tpl.template_id || idx} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <div className="font-semibold">{tpl.template_name}</div>
                    <div className="text-sm text-gray-500">Loại: {tpl.template_type}</div>
                    <div className="text-sm text-gray-500">Ngày tạo: {tpl.created_at ? new Date(tpl.created_at).toLocaleString() : ''}</div>
                    <a href={tpl.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Xem file</a>
                  </div>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={async () => {
                      if (!window.confirm('Bạn chắc chắn muốn xóa template này?')) return;
                      try {
                        await deleteTemplate(tpl.template_id);
                        alert('Đã xóa template!');
                        fetchTemplates();
                      } catch (err: any) {
                        alert('Xóa thất bại: ' + (err?.message || 'Unknown error'));
                      }
                    }}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </>
  );
}
