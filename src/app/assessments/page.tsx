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
    <div className="container mx-auto p-6 max-w-7xl">
      <Navigation />
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thẩm định tín dụng</h1>
            <p className="text-gray-600">
              Quản lý và theo dõi các thẩm định tín dụng cho khách hàng.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedAssessment(null)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thẩm định mới
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center w-full max-w-xl">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm thẩm định..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Danh sách thẩm định</h2>
        </div>
        <div className="p-6">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thẩm định nào</h3>
              <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo thẩm định đầu tiên</p>
              <button
                onClick={() => {
                  setSelectedAssessment(null)
                  setShowForm(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Thẩm định mới
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <div className="min-h-screen px-4 py-8 text-center bg-black bg-opacity-50 flex items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          
          <div className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            <Dialog.Title
              as="h3"
              className="text-lg font-semibold text-gray-900"
            >
              Xác nhận xóa
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn xóa thẩm định này? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                onClick={() => setShowDeleteDialog(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                onClick={handleDeleteAssessment}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
