'use client'

import React from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Button,
  Grid2 as Grid,
  Stack,
  Paper
} from '@mui/material'
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material'

interface ContractFiltersProps {
  filters: {
    search: string
    status: string
    customerId: string
    productId: string
    signedBy: string
    dateRange: string
    creditRange: string
  }
  onFiltersChange: (filters: {
    search: string
    status: string
    customerId: string
    productId: string
    signedBy: string
    dateRange: string
    creditRange: string
  }) => void
  availableCustomers: Array<{ customer_id: number; full_name: string }>
  availableProducts: Array<{ product_id: number; product_name: string }>
  availableStaff: Array<{ staff_id: number; full_name: string }>
  totalCount: number
  filteredCount: number
}

export default function ContractFilters({
  filters,
  onFiltersChange,
  availableCustomers,
  availableProducts,
  availableStaff,
  totalCount,
  filteredCount
}: ContractFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      customerId: '',
      productId: '',
      signedBy: '',
      dateRange: '',
      creditRange: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status || filters.customerId || 
                          filters.productId || filters.signedBy || filters.dateRange || filters.creditRange

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900">Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {/* Search Filter */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Tìm kiếm hợp đồng
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Tìm theo số hợp đồng, khách hàng..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="active">Đang hiệu lực</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
            Khách hàng
          </label>
          <select
            id="customerId"
            value={filters.customerId}
            onChange={(e) => handleFilterChange('customerId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khách hàng</option>
            {availableCustomers.map((customer) => (
              <option key={customer.customer_id} value={customer.customer_id}>
                {customer.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
            Sản phẩm
          </label>
          <select
            id="productId"
            value={filters.productId}
            onChange={(e) => handleFilterChange('productId', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả sản phẩm</option>
            {availableProducts.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.product_name}
              </option>
            ))}
          </select>
        </div>

        {/* Signed By Filter */}
        <div>
          <label htmlFor="signedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Người ký
          </label>
          <select
            id="signedBy"
            value={filters.signedBy}
            onChange={(e) => handleFilterChange('signedBy', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả nhân viên</option>
            {availableStaff.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng thời gian
          </label>
          <select
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả thời gian</option>
            <option value="current">Đang có hiệu lực</option>
            <option value="starting-soon">Bắt đầu trong tháng</option>
            <option value="expiring-soon">Hết hạn trong tháng</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {/* Credit Range Filter */}
        <div>
          <label htmlFor="creditRange" className="block text-sm font-medium text-gray-700 mb-1">
            Hạn mức tín dụng
          </label>
          <select
            id="creditRange"
            value={filters.creditRange}
            onChange={(e) => handleFilterChange('creditRange', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả hạn mức</option>
            <option value="0-2000000000">0 - 2 tỷ đồng</option>
            <option value="1000000000-5000000000">1 tỷ - 5 tỷ đồng</option>
            <option value="5000000000-10000000000">5 tỷ - 10 tỷ đồng</option>
            <option value="10000000000+">10 tỷ đồng+</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <span>
          Hiển thị {filteredCount} trong tổng số {totalCount} hợp đồng
          {hasActiveFilters && (
            <span className="text-blue-600 ml-1">
              (đã lọc)
            </span>
          )}
        </span>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Bộ lọc đang áp dụng:</span>
            <div className="flex gap-1 flex-wrap">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Trạng thái: {filters.status}
                </span>
              )}
              {filters.customerId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Khách hàng
                </span>
              )}
              {filters.productId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  Sản phẩm
                </span>
              )}
              {filters.signedBy && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Người ký
                </span>
              )}
              {filters.dateRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Thời gian: {filters.dateRange}
                </span>
              )}
              {filters.creditRange && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Hạn mức: {filters.creditRange}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
