import { useState, useEffect, useRef } from 'react';
import { uploadTemplateToVercelBlob, fetchTemplatesListFromVercelBlob } from '@/lib/vercelBlob';

export default function TemplatesDashboard() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      const list = await fetchTemplatesListFromVercelBlob('maubieu/');
      setTemplates(list);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    const documentType = (form.elements.namedItem('documentType') as HTMLSelectElement).value;
    if (!file) return;
    setUploading(true);
    await uploadTemplateToVercelBlob(file, `maubieu/${documentType}.docx`);
    // Refetch list
    const list = await fetchTemplatesListFromVercelBlob('maubieu/');
    setTemplates(list);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Quản lý Template</h1>
      <div className="mb-6">
        <form className="flex gap-2 items-center" onSubmit={handleUpload}>
          <input ref={fileRef} type="file" name="template" accept=".docx" className="border p-2 rounded" />
          <select name="documentType" className="border p-2 rounded">
            <option value="hop_dong_tin_dung">Hợp đồng tín dụng</option>
            <option value="to_trinh_tham_dinh">Tờ trình thẩm định</option>
            <option value="giay_de_nghi_vay_von">Giấy đề nghị vay vốn</option>
            <option value="bien_ban_dinh_gia">Biên bản định giá</option>
            <option value="hop_dong_the_chap">Hợp đồng thế chấp</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={uploading}>{uploading ? 'Đang upload...' : 'Upload'}</button>
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
                      const res = await fetch(`/api/templates?file=maubieu/${tpl}`, { method: 'DELETE' });
                      const data = await res.json();
                      if (res.ok) {
                        setTemplates(list => list.filter(t => t !== tpl));
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
