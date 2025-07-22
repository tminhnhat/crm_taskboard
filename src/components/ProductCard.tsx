import { Product } from '@/lib/supabase'
import { 
  CubeIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
  onStatusChange: (productId: number, status: string) => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800'
}

export default function ProductCard({ product, onEdit, onDelete, onStatusChange }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <CubeIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
              {product.product_type && (
                <p className="text-sm text-gray-600">Loại: {product.product_type}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {product.status === 'active' ? 'Đang Hoạt Động' :
               product.status === 'inactive' ? 'Không Hoạt Động' :
               product.status.charAt(0).toUpperCase() + product.status.slice(1)}
            </span>
            {product.product_type && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <TagIcon className="h-3 w-3 mr-1" />
                {product.product_type}
              </span>
            )}
          </div>
          
          {product.description && (
            <div className="mb-3">
              <div className="flex items-start">
                <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
          )}

          {product.metadata && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-xs font-medium text-gray-700 mb-2">Metadata:</p>
              <div className="space-y-1">
                {Object.entries(product.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="text-gray-800">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          <select
            value={product.status}
            onChange={(e) => onStatusChange(product.product_id, e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Đang Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(product)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(product.product_id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
