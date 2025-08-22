
"use client";

import Navigation from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  customer_id: number;
  full_name: string;
}

interface Collateral {
  collateral_id: number;
  description: string;
}

interface Assessment {
  assessment_id: number;
  department: string;
}

interface Document {
  name: string;
  filePath: string;
}

export default function DocumentsDashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const documentTypes = [
    { id: 'hop_dong_tin_dung', name: 'Hợp đồng tín dụng', formats: ['docx'] },
    { id: 'to_trinh_tham_dinh', name: 'Tờ trình thẩm định', formats: ['docx'] },
    { id: 'giay_de_nghi_vay_von', name: 'Giấy đề nghị vay vốn', formats: ['docx'] },
    { id: 'bien_ban_dinh_gia', name: 'Biên bản định giá', formats: ['docx'] },
    { id: 'hop_dong_the_chap', name: 'Hợp đồng thế chấp', formats: ['docx'] },
    { id: 'bang_tinh_lai', name: 'Bảng tính lãi', formats: ['xlsx'] },
    { id: 'lich_tra_no', name: 'Lịch trả nợ', formats: ['xlsx'] },
  ];

  const [form, setForm] = useState({
    documentType: 'hop_dong_tin_dung',
    customerId: '',
    collateralId: '',
    creditAssessmentId: '',
    exportType: 'docx',
  });

  const fetchData = async () => {
    try {
      const [customersRes, collateralsRes, assessmentsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('customer_id, full_name')
          .eq('status', 'active')
          .order('full_name'),
        supabase
          .from('collaterals')
          .select('collateral_id, description')
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
        supabase
          .from('credit_assessments')
          .select('assessment_id, department')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
      ]);

      // Check for errors
      if (customersRes.error) throw new Error(`Error loading customers: ${customersRes.error.message}`);
      if (collateralsRes.error) throw new Error(`Error loading collaterals: ${collateralsRes.error.message}`);
      if (assessmentsRes.error) throw new Error(`Error loading assessments: ${assessmentsRes.error.message}`);
      
      setCustomers(customersRes.data || []);
      setCollaterals(collateralsRes.data || []);
      setAssessments(assessmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Error loading data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null); // Clear any previous errors
    setForm(prevForm => ({ 
      ...prevForm, 
      [e.target.name]: e.target.value 
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    // Validate required fields
    if (!form.customerId) {
      setError('Please select a customer');
      setCreating(false);
      return;
    }

    if (!form.documentType) {
      setError('Please select a document type');
      setCreating(false);
      return;
    }

    try {
      const response = await fetch('/api/documents', {
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

      if (response.ok) {
        // Lấy filename từ Content-Disposition header hoặc tạo default
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : `${form.documentType}_${form.customerId}_${new Date().getTime()}.${form.exportType}`;

        // Tải file xuống
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Update documents list
        setDocuments(prevDocs => [
          { name: filename, filePath: filename },
          ...prevDocs,
        ]);
        setShowCreate(false);
        
        // Reset form
        setForm({
          documentType: 'hop_dong_tin_dung',
          customerId: '',
          collateralId: '',
          creditAssessmentId: '',
          exportType: 'docx',
        });
        
        alert('Tài liệu đã được tạo và tải xuống thành công!');
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.error || 'Tạo tài liệu thất bại');
        } catch {
          alert('Tạo tài liệu thất bại: ' + errorText);
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Lỗi kết nối API');
    } finally {
      setCreating(false);
    }
  };

  const handleSendEmail = async (fileName: string) => {
    const email = prompt('Nhập email người nhận:');
    if (!email) return;

    try {
      const response = await fetch('/api/documents/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('Đã gửi mail thành công!');
      } else {
        alert(data.error || 'Gửi mail thất bại');
      }
    } catch (error) {
      console.error('Email Error:', error);
      alert('Lỗi gửi mail');
    }
  };

  const handleDeleteDocument = async (fileName: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài liệu này?')) return;

    try {
      const response = await fetch(`/api/documents?file=${encodeURIComponent(fileName)}`, { 
        method: 'DELETE' 
      });
      const data = await response.json();
      
      if (response.ok) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.name !== fileName));
        alert('Đã xóa tài liệu!');
      } else {
        alert(data.error || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Delete Error:', error);
      alert('Lỗi xóa tài liệu');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Quản lý Tài liệu</h1>
      <div className="mb-6">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowCreate(true)}>
          Tạo tài liệu mới
        </button>
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form 
              className="bg-white p-6 rounded shadow w-full max-w-md space-y-4 relative" 
              onSubmit={handleCreate}
            >
              <button 
                type="button" 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setShowCreate(false)}
              >
                &times;
              </button>
              
              <h2 className="text-lg font-semibold mb-4">Tạo tài liệu từ template</h2>
              
              <div>
                <label className="block mb-1 font-medium">Loại tài liệu</label>
                <select 
                  name="documentType" 
                  className="border p-2 rounded w-full" 
                  value={form.documentType} 
                  onChange={(e) => {
                    const selectedType = documentTypes.find(t => t.id === e.target.value);
                    setForm(prev => ({
                      ...prev,
                      documentType: e.target.value,
                      exportType: selectedType?.formats[0] || 'docx'
                    }));
                  }}
                  required
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Định dạng</label>
                <select 
                  name="exportType" 
                  className="border p-2 rounded w-full" 
                  value={form.exportType} 
                  onChange={handleChange}
                  required
                >
                  {documentTypes
                    .find(t => t.id === form.documentType)
                    ?.formats.map(format => (
                      <option key={format} value={format}>
                        {format.toUpperCase()}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Khách hàng</label>
                <select 
                  name="customerId" 
                  className="border p-2 rounded w-full" 
                  value={form.customerId} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Tài sản đảm bảo</label>
                <select 
                  name="collateralId" 
                  className="border p-2 rounded w-full" 
                  value={form.collateralId} 
                  onChange={handleChange}
                >
                  <option value="">-- Không chọn --</option>
                  {collaterals.map(collateral => (
                    <option key={collateral.collateral_id} value={collateral.collateral_id}>
                      {collateral.description || `Tài sản ${collateral.collateral_id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Tờ trình thẩm định</label>
                <select 
                  name="creditAssessmentId" 
                  className="border p-2 rounded w-full" 
                  value={form.creditAssessmentId} 
                  onChange={handleChange}
                >
                  <option value="">-- Không chọn --</option>
                  {assessments.map(assessment => (
                    <option key={assessment.assessment_id} value={assessment.assessment_id}>
                      {assessment.department || `Thẩm định ${assessment.assessment_id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Định dạng xuất</label>
                <select 
                  name="exportType" 
                  className="border p-2 rounded w-full" 
                  value={form.exportType} 
                  onChange={handleChange}
                  required
                >
                  <option value="docx">Word (.docx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50" 
                disabled={creating}
              >
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
                  onClick={() => handleSendEmail(doc.name)}
                >
                  Gửi mail
                </button>
                <a
                  className="text-green-600 hover:underline"
                  href={`/api/documents?file=${encodeURIComponent(doc.name)}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tải về
                </a>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDeleteDocument(doc.name)}
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
