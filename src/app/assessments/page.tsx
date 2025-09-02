'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import CreditAssessmentCard from '@/components/CreditAssessmentCard'
import CreditAssessmentForm from '@/components/CreditAssessmentForm'
import Navigation from '@/components/Navigation'
import useCreditAssessments from '@/hooks/useCreditAssessments'
import { useCustomers } from '@/hooks/useCustomers'
import { useStaff } from '@/hooks/useStaff'
import { useProducts } from '@/hooks/useProducts'

export default function AssessmentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    isLoading,
    error,
    fetchAssessments,
    createAssessment,
    updateAssessment,
    deleteAssessment
  } = useCreditAssessments()

  const { customers } = useCustomers()
  const { staff } = useStaff()
  const { products } = useProducts()

  const [assessments, setAssessments] = useState<any[]>([])

  React.useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    const data = await fetchAssessments()
    setAssessments(data)
  }

  const handleCreateAssessment = async (data: any) => {
    await createAssessment(data)
    setShowForm(false)
    loadAssessments()
  }

  const handleUpdateAssessment = async (data: any) => {
    if (selectedAssessment) {
      await updateAssessment(selectedAssessment.assessment_id, data)
      setShowForm(false)
      setSelectedAssessment(null)
      loadAssessments()
    }
  }

  const handleDeleteAssessment = async () => {
    if (selectedAssessment) {
      await deleteAssessment(selectedAssessment.assessment_id)
      setShowDeleteDialog(false)
      setSelectedAssessment(null)
      loadAssessments()
    }
  }

  const filteredAssessments = assessments.filter(assessment => {
    const searchStr = searchTerm.toLowerCase()
    return (
      assessment.customer?.full_name?.toLowerCase().includes(searchStr) ||
      assessment.staff?.full_name?.toLowerCase().includes(searchStr) ||
      assessment.product?.product_name?.toLowerCase().includes(searchStr) ||
      assessment.department?.toLowerCase().includes(searchStr)
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Enhanced header section */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500 to-teal-500 opacity-5 rounded-tr-full"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Thẩm định tín dụng</h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Quản lý và theo dõi các thẩm định tín dụng cho khách hàng một cách hiệu quả.
                  </p>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600 font-medium">{filteredAssessments.length} thẩm định</span>
                    </div>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">Cập nhật realtime</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedAssessment(null)
                    setShowForm(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  ✨ Thẩm định mới
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Enhanced Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Tìm kiếm thẩm định theo tên khách hàng, nhân viên, sản phẩm..."
                className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-focus-within:opacity-5 transition-opacity pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Assessment List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">📋 Danh sách thẩm định</h2>
                <p className="text-gray-600 mt-1 font-medium">Tổng cộng {filteredAssessments.length} bản thẩm định</p>
              </div>
              <div className="flex items-center space-x-4">
                {searchTerm && (
                  <div className="bg-blue-100 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm text-blue-800 font-semibold">Tìm thấy: {filteredAssessments.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 Chưa có thẩm định nào</h3>
                <p className="text-gray-600 mb-8 text-lg font-medium max-w-md mx-auto">
                  {searchTerm 
                    ? `Không tìm thấy kết quả cho "${searchTerm}". Hãy thử từ khóa khác.`
                    : 'Bắt đầu bằng cách tạo thẩm định đầu tiên cho khách hàng của bạn.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setSelectedAssessment(null)
                      setShowForm(true)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    ✨ Tạo thẩm định đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAssessments.map(assessment => (
                  <CreditAssessmentCard
                    key={assessment.assessment_id}
                    assessment={assessment}
                    onView={() => {
                      setSelectedAssessment(assessment)
                      setShowForm(true)
                    }}
                    onEdit={() => {
                      setSelectedAssessment(assessment)
                      setShowForm(true)
                    }}
                    onDelete={() => {
                      setSelectedAssessment(assessment)
                      setShowDeleteDialog(true)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Assessment Form Dialog */}
      {showForm && (
        <CreditAssessmentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setSelectedAssessment(null)
          }}
          onSubmit={selectedAssessment ? handleUpdateAssessment : handleCreateAssessment}
          assessment={selectedAssessment}
          isLoading={isLoading}
          customers={customers}
          staff={staff}
          products={products}
        />
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <div className="min-h-screen px-4 py-8 text-center bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-60" />
          
          <div className="inline-block w-full max-w-md p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <Dialog.Title as="h3" className="text-2xl font-bold text-center text-gray-900 mb-4">
              ⚠️ Xác nhận xóa
            </Dialog.Title>
            <div className="mb-8">
              <p className="text-center text-gray-600 text-lg font-medium">
                Bạn có chắc chắn muốn xóa thẩm định này không?
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 text-center font-semibold">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-200"
                onClick={() => setShowDeleteDialog(false)}
              >
                🚫 Hủy bỏ
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
                onClick={handleDeleteAssessment}
              >
                🗑️ Xóa ngay
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      </div>
    </div>
  )
}
