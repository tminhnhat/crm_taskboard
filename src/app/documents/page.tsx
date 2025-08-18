'use client'

import DocumentGenerator from '@/components/DocumentGenerator'

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản Lý Tài Liệu</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tạo Tài Liệu Mới</h2>
        
        {/* DOCX Generator */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Tạo file DOCX</h3>
          <DocumentGenerator
            templateType="docx"
            data={{
              // Example data structure for DOCX template
              customerName: "Nguyễn Văn A",
              documentDate: new Date().toLocaleDateString('vi-VN'),
              // Add more fields as needed
            }}
          />
        </div>

        {/* XLSX Generator */}
        <div>
          <h3 className="text-lg font-medium mb-3">Tạo file XLSX</h3>
          <DocumentGenerator
            templateType="xlsx"
            data={{
              // Example data structure for XLSX template
              Sheet1: [
                { name: "Nguyễn Văn A", amount: 1000000 },
                { name: "Trần Thị B", amount: 2000000 },
              ]
            }}
          />
        </div>
      </div>

      {/* History Section */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lịch Sử Tài Liệu</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Tài Liệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Add your document history items here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
