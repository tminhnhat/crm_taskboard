import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard Quản lý Tài liệu & Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/templates" className="block p-6 bg-white rounded shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Quản lý Template</h2>
          <p>Upload, cập nhật, xóa và xem danh sách các mẫu biểu (template) hồ sơ tín dụng.</p>
        </Link>
        <Link href="/dashboard/documents" className="block p-6 bg-white rounded shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Quản lý Tài liệu</h2>
          <p>Tạo tài liệu từ template, tìm kiếm, lọc, gửi mail hoặc tải về tài liệu đã tạo.</p>
        </Link>
      </div>
    </div>
  );
}
