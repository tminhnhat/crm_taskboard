'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Staff } from '@/lib/supabase'

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      setStaff(data || [])
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch staff')
    } finally {
      setLoading(false)
    }
  }

  // Create new staff member
  const createStaff = async (staffData: Partial<Staff>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('staff')
        .insert([staffData])
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setStaff(prev => [...prev, data])
      }

      return data
    } catch (err) {
      console.error('Error creating staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to create staff')
      throw err
    }
  }

  // Update staff member
  const updateStaff = async (staffId: number, updates: Partial<Staff>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('staff')
        .update(updates)
        .eq('staff_id', staffId)
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setStaff(prev => prev.map(s => s.staff_id === staffId ? data : s))
      }

      return data
    } catch (err) {
      console.error('Error updating staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to update staff')
      throw err
    }
  }

  // Delete staff member
  const deleteStaff = async (staffId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('staff_id', staffId)

      if (error) {
        throw error
      }

      setStaff(prev => prev.filter(s => s.staff_id !== staffId))
    } catch (err) {
      console.error('Error deleting staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete staff')
      throw err
    }
  }

  // Get staff by ID
  const getStaffById = async (staffId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('staff_id', staffId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching staff by ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch staff')
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    fetchStaff()
  }, [])

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffById
  }
}
