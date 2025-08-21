"use client";

import { useState } from 'react';

const DUMMY_CUSTOMERS = [
  { customer_id: '1', full_name: 'Nguyễn Văn A' },
  { customer_id: '2', full_name: 'Trần Thị B' },
];
const DUMMY_COLLATERALS = [
  { collateral_id: '1', name: 'Nhà đất Q1' },
  { collateral_id: '2', name: 'Xe ô tô' },
];
const DUMMY_ASSESSMENTS = [
  { assessment_id: '1', name: 'Thẩm định 1' },
  { assessment_id: '2', name: 'Thẩm định 2' },
];

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    documentType: 'hop_dong_tin_dung',
    customerId: '',
    collateralId: '',
    creditAssessmentId: '',
    exportType: 'docx',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: form.documentType,
          customerId: form.customerId,
          collateralId: form.collateralId || undefined,
          creditAssessmentId: form.creditAssessmentId || undefined,
          exportType: form.exportType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.filePath) {
        const fileName = data.filePath.split('/').pop();
        setDocuments(docs => [
          { name: fileName, filePath: data.filePath },
          ...docs,
        ]);
        setShowCreate(false);
      } else {
        alert(data.error || 'Tạo tài liệu thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối API');
    }
    setCreating(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Quản lý Tài liệu</h1>
      <div className="mb-6">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate(true)}>
          Tạo tài liệu mới
        </button>
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form className="bg-white p-6 rounded shadow w-full max-w-md space-y-4 relative" onSubmit={handleCreate}>
              <button type="button" className="absolute top-2 right-2 text-gray-500" onClick={() => setShowCreate(false)}>&times;</button>
              <h2 className="text-lg font-semibold mb-2">Tạo tài liệu từ template</h2>
              <div>
                <label className="block mb-1">Loại tài liệu</label>
                <select name="documentType" className="border p-2 rounded w-full" value={form.documentType} onChange={handleChange}>
                  <option value="hop_dong_tin_dung">Hợp đồng tín dụng</option>
                  <option value="to_trinh_tham_dinh">Tờ trình thẩm định</option>
                  <option value="giay_de_nghi_vay_von">Giấy đề nghị vay vốn</option>
                  <option value="bien_ban_dinh_gia">Biên bản định giá</option>
                  <option value="hop_dong_the_chap">Hợp đồng thế chấp</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Khách hàng</label>
                <select name="customerId" className="border p-2 rounded w-full" value={form.customerId} onChange={handleChange} required>
                  <option value="">-- Chọn khách hàng --</option>
                  {DUMMY_CUSTOMERS.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Tài sản đảm bảo</label>
                <select name="collateralId" className="border p-2 rounded w-full" value={form.collateralId} onChange={handleChange}>
                  <option value="">-- Không chọn --</option>
                  {DUMMY_COLLATERALS.map(c => (
                    <option key={c.collateral_id} value={c.collateral_id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Tờ trình thẩm định</label>
                <select name="creditAssessmentId" className="border p-2 rounded w-full" value={form.creditAssessmentId} onChange={handleChange}>
                  <option value="">-- Không chọn --</option>
                  {DUMMY_ASSESSMENTS.map(a => (
                    <option key={a.assessment_id} value={a.assessment_id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Định dạng xuất</label>
                <select name="exportType" className="border p-2 rounded w-full" value={form.exportType} onChange={handleChange}>
                  <option value="docx">Word (.docx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full" disabled={creating}>
                {creating ? 'Đang tạo...' : 'Tạo tài liệu'}
              </button>
            </form>
          </div>
        )}
      </div>
      <div>
        <h2 className="font-semibold mb-2">Danh sách Tài liệu đã tạo</h2>
        <ul className="divide-y">
          {documents.length === 0 && <li className="py-2 text-gray-500">Chưa có tài liệu nào.</li>}
          {documents.map((doc, idx) => (
            <li key={idx} className="py-2 flex justify-between items-center">
              <span>{doc.name}</span>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={async () => {
                    const email = prompt('Nhập email người nhận:');
                    if (!email) return;
                    try {
                      const res = await fetch('/api/documents/sendmail', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileName: doc.name, email }),
                      });
                      const data = await res.json();
                      if (res.ok) alert('Đã gửi mail thành công!');
                      else alert(data.error || 'Gửi mail thất bại');
                    } catch {
                      alert('Lỗi gửi mail');
                    }
                  }}
                >
                  Gửi mail
                </button>
                <a
                  className="text-green-600 hover:underline"
                  href={doc.name ? `/api/documents?file=${encodeURIComponent(doc.name)}` : '#'}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tải về
                </a>
                <button
                  className="text-red-500 hover:underline"
                  onClick={async () => {
                    if (!window.confirm('Bạn chắc chắn muốn xóa tài liệu này?')) return;
                    try {
                      const res = await fetch(`/api/documents?file=${encodeURIComponent(doc.name)}`, { method: 'DELETE' });
                      const data = await res.json();
                      if (res.ok) {
                        setDocuments(docs => docs.filter(d => d.name !== doc.name));
                        alert('Đã xóa tài liệu!');
                      } else {
                        alert(data.error || 'Xóa thất bại');
                      }
                    } catch {
                      alert('Lỗi xóa tài liệu');
                    }
                  }}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
