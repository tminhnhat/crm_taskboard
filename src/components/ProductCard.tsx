import { Product } from '@/lib/supabase'
import { 
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  BanknotesIcon,
  PercentBadgeIcon,
  ClockIcon,
  CurrencyDollarIcon
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

const productTypeColors = {
  'Savings Account': 'bg-blue-100 text-blue-800',
  'Current Account': 'bg-purple-100 text-purple-800',
  'Term Deposit': 'bg-green-100 text-green-800',
  'Personal Loan': 'bg-orange-100 text-orange-800',
  'Home Loan': 'bg-red-100 text-red-800',
  'Auto Loan': 'bg-yellow-100 text-yellow-800',
  'Business Loan': 'bg-indigo-100 text-indigo-800',
  'Credit Card': 'bg-pink-100 text-pink-800',
  'Debit Card': 'bg-gray-100 text-gray-800',
  'Life Insurance': 'bg-teal-100 text-teal-800',
  'Health Insurance': 'bg-emerald-100 text-emerald-800',
  'Property Insurance': 'bg-cyan-100 text-cyan-800',
  'Auto Insurance': 'bg-lime-100 text-lime-800',
  'Investment': 'bg-violet-100 text-violet-800',
  'Foreign Exchange': 'bg-amber-100 text-amber-800',
  'Money Transfer': 'bg-rose-100 text-rose-800',
  'Cash Management': 'bg-slate-100 text-slate-800',
  'Trade Finance': 'bg-stone-100 text-stone-800',
  'Payment Services': 'bg-neutral-100 text-neutral-800',
  'Safe Deposit Box': 'bg-zinc-100 text-zinc-800',
  'Financial Advisory': 'bg-sky-100 text-sky-800'
}

export default function ProductCard({ product, onEdit, onDelete, onStatusChange }: ProductCardProps) {
  const formatCurrency = (amount: number, currency = 'VND') => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <CubeIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
              {product.product_type && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  productTypeColors[product.product_type as keyof typeof productTypeColors] || 'bg-gray-100 text-gray-800'
                }`}>
                  <TagIcon className="h-3 w-3 mr-1" />
                  {product.product_type}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[product.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
          }`}>
            {product.status === 'active' ? 'Hoạt Động' : 'Tạm Ngưng'}
          </span>
        </div>
      </div>

      {/* Banking Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {product.interest_rate && (
          <div className="flex items-center text-sm">
            <PercentBadgeIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-gray-600">Lãi suất:</span>
            <span className="ml-1 font-semibold text-green-600">{product.interest_rate}%/năm</span>
          </div>
        )}
        
        {product.terms_months && (
          <div className="flex items-center text-sm">
            <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-gray-600">Thời hạn:</span>
            <span className="ml-1 font-semibold text-blue-600">{product.terms_months} tháng</span>
          </div>
        )}
        
        {(product.minimum_amount || product.maximum_amount) && (
          <div className="col-span-2">
            <div className="flex items-center text-sm">
              <BanknotesIcon className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-gray-600">Hạn mức:</span>
              <span className="ml-1 font-semibold text-purple-600">
                {product.minimum_amount && formatCurrency(product.minimum_amount, product.currency || 'VND')}
                {product.minimum_amount && product.maximum_amount && ' - '}
                {product.maximum_amount && formatCurrency(product.maximum_amount, product.currency || 'VND')}
              </span>
            </div>
          </div>
        )}
        
        {product.fees && (
          <div className="flex items-center text-sm">
            <CurrencyDollarIcon className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-gray-600">Phí:</span>
            <span className="ml-1 font-semibold text-orange-600">
              {formatCurrency(product.fees, product.currency || 'VND')}
            </span>
          </div>
        )}
      </div>
      
      {product.description && (
        <div className="mb-3">
          <div className="flex items-start">
            <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
          </div>
        </div>
      )}

      {product.requirements && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Điều kiện:</p>
          <p className="text-xs text-gray-600 line-clamp-2">{product.requirements}</p>
        </div>
      )}

      {product.benefits && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1">Ưu đãi:</p>
          <p className="text-xs text-gray-600 line-clamp-2">{product.benefits}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Chỉnh Sửa
          </button>
          <button
            onClick={() => onDelete(product.product_id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Xóa
          </button>
        </div>
        
        <select
          value={product.status}
          onChange={(e) => onStatusChange(product.product_id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Hoạt Động</option>
          <option value="inactive">Tạm Ngưng</option>
        </select>
      </div>
    </div>
  )
}
