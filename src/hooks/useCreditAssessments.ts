'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Assessment {
  assessment_id: number
  customer_id: number
  staff_id: number
  product_id: number
  department: string
  department_head: string
  fee_amount: number
  status: string
  loan_info: any
  business_plan: any
  financial_reports: any
  assessment_details: any
  metadata: any
  created_at: string
  updated_at: string
}

export default function useCreditAssessments() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssessments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('credit_assessments')
        .select(`
          *,
          customer:customers(customer_id, full_name),
          staff:staff(staff_id, full_name),
          product:products(product_id, product_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssessmentById = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('credit_assessments')
        .select(`
          *,
          customer:customers(customer_id, full_name),
          staff:staff(staff_id, full_name),
          product:products(product_id, product_name)
        `)
        .eq('assessment_id', id)
        .single()

      if (error) throw error

      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createAssessment = async (assessmentData: Partial<Assessment>) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('credit_assessments')
        .insert(assessmentData)
        .select()
        .single()

      if (error) throw error

      router.refresh()
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const updateAssessment = async (id: number, assessmentData: Partial<Assessment>) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('credit_assessments')
        .update(assessmentData)
        .eq('assessment_id', id)
        .select()
        .single()

      if (error) throw error

      router.refresh()
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAssessment = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase
        .from('credit_assessments')
        .delete()
        .eq('assessment_id', id)

      if (error) throw error

      router.refresh()
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    fetchAssessments,
    fetchAssessmentById,
    createAssessment,
    updateAssessment,
    deleteAssessment
  }
}
