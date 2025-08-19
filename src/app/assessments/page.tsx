'use client'

import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import CreditAssessmentCard from '@/components/CreditAssessmentCard'
import CreditAssessmentForm from '@/components/CreditAssessmentForm'
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thẩm định tín dụng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các thẩm định tín dụng cho khách hàng
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedAssessment(null)
            setShowForm(true)
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Thẩm định mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center max-w-lg">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm thẩm định..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Assessment List */}
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
        <div className="min-h-screen px-4 text-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Xác nhận xóa
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa thẩm định này? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                onClick={() => setShowDeleteDialog(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
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
