'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { CreditAssessment, Customer, Staff } from '@/lib/supabase'

export function useCreditAssessments() {
  const [assessments, setAssessments] = useState<CreditAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all credit assessments with related data
  const fetchAssessments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('credit_assessments')
        .select(`
          *,
          customer:customers(*),
          staff:staff(*)
        `)
        .order('assessment_date', { ascending: false })

      if (error) {
        throw error
      }

      setAssessments(data || [])
    } catch (err) {
      console.error('Error fetching credit assessments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch credit assessments')
    } finally {
      setLoading(false)
    }
  }

  // Create new credit assessment
  const createAssessment = async (assessmentData: Partial<CreditAssessment>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('credit_assessments')
        .insert([assessmentData])
        .select(`
          *,
          customer:customers(*),
          staff:staff(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setAssessments(prev => [data, ...prev])
      }
      
      return data
    } catch (err) {
      console.error('Error creating credit assessment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create credit assessment')
      throw err
    }
  }

  // Update existing credit assessment
  const updateAssessment = async (assessmentId: number, assessmentData: Partial<CreditAssessment>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('credit_assessments')
        .update(assessmentData)
        .eq('assessment_id', assessmentId)
        .select(`
          *,
          customer:customers(*),
          staff:staff(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setAssessments(prev => prev.map(assessment => 
          assessment.assessment_id === assessmentId ? data : assessment
        ))
      }
      
      return data
    } catch (err) {
      console.error('Error updating credit assessment:', err)
      setError(err instanceof Error ? err.message : 'Failed to update credit assessment')
      throw err
    }
  }

  // Delete credit assessment
  const deleteAssessment = async (assessmentId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('credit_assessments')
        .delete()
        .eq('assessment_id', assessmentId)

      if (error) {
        throw error
      }

      setAssessments(prev => prev.filter(assessment => assessment.assessment_id !== assessmentId))
    } catch (err) {
      console.error('Error deleting credit assessment:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete credit assessment')
      throw err
    }
  }

  // Fetch customers for dropdowns
  const fetchCustomers = async (): Promise<Customer[]> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      return []
    }
  }

  // Fetch staff for dropdowns
  const fetchStaff = async (): Promise<Staff[]> => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('status', 'active')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching staff:', err)
      return []
    }
  }

  // Get assessment statistics
  const getAssessmentStats = () => {
    const total = assessments.length
    const approved = assessments.filter(a => a.assessment_result?.toLowerCase() === 'approved').length
    const rejected = assessments.filter(a => a.assessment_result?.toLowerCase() === 'rejected').length
    const pending = assessments.filter(a => a.assessment_result?.toLowerCase() === 'pending' || !a.assessment_result).length
    
    const avgCreditScore = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + (a.credit_score || 0), 0) / assessments.filter(a => a.credit_score).length
      : 0

    return {
      total,
      approved,
      rejected,
      pending,
      avgCreditScore: Math.round(avgCreditScore)
    }
  }

  // Initialize data
  useEffect(() => {
    fetchAssessments()
  }, [])

  return {
    assessments,
    loading,
    error,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    fetchCustomers,
    fetchStaff,
    getAssessmentStats,
    refetch: fetchAssessments
  }
}
