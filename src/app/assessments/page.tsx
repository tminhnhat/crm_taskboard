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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <Navigation />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-8 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-700 mb-2 drop-shadow">Thẩm định tín dụng</h1>
            <p className="text-lg text-gray-500">Quản lý các thẩm định tín dụng cho khách hàng</p>
          </div>
          <button
            onClick={() => {
              setSelectedAssessment(null)
              setShowForm(true)
            }}
            className="px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow"
          >
            + Thẩm định mới
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-10 flex justify-center">
          <div className="flex items-center w-full max-w-xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm thẩm định..."
                className="block w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl leading-5 bg-white placeholder-blue-400 focus:outline-none focus:placeholder-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>
        </div>

        {/* Assessment List */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
        </div>
      </main>

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
