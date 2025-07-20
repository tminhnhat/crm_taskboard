import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bars3Icon, 
  ClipboardDocumentListIcon, 
  UsersIcon,
  CubeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function Navigation() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Công Việc', href: '/', icon: ClipboardDocumentListIcon },
    { name: 'Khách Hàng', href: '/customers', icon: UsersIcon },
    { name: 'Sản Phẩm', href: '/products', icon: CubeIcon },
    { name: 'Nhân Viên', href: '/staff', icon: UserIcon },
    { name: 'Tương Tác', href: '/interactions', icon: ChatBubbleLeftRightIcon },
    { name: 'Cơ Hội', href: '/opportunities', icon: CurrencyDollarIcon },
    { name: 'Hợp Đồng', href: '/contracts', icon: DocumentTextIcon },
    { name: 'Đánh Giá Tín Dụng', href: '/credit-assessments', icon: DocumentChartBarIcon },
    { name: 'Tài Sản Thế Chấp', href: '/collaterals', icon: HomeIcon },
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Bars3Icon className="h-6 w-6 text-gray-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Hệ Thống Quản Lý</h1>
            </div>
            
            <div className="flex space-x-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
