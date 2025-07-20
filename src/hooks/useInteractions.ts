'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Interaction, Customer, Staff } from '@/lib/supabase'

export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all interactions with customer and staff details
  const fetchInteractions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .order('interaction_date', { ascending: false })

      if (error) {
        throw error
      }

      setInteractions(data || [])
    } catch (err) {
      console.error('Error fetching interactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch interactions')
    } finally {
      setLoading(false)
    }
  }

  // Fetch interactions for a specific customer
  const fetchInteractionsByCustomer = async (customerId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .eq('customer_id', customerId)
        .order('interaction_date', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching customer interactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer interactions')
      throw err
    }
  }

  // Fetch interactions for a specific staff member
  const fetchInteractionsByStaff = async (staffId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .eq('staff_id', staffId)
        .order('interaction_date', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching staff interactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch staff interactions')
      throw err
    }
  }

  // Create new interaction
  const createInteraction = async (interactionData: Partial<Interaction>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .insert([interactionData])
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setInteractions(prev => [data, ...prev])
      }

      return data
    } catch (err) {
      console.error('Error creating interaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to create interaction')
      throw err
    }
  }

  // Update interaction
  const updateInteraction = async (interactionId: number, updates: Partial<Interaction>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .update(updates)
        .eq('interaction_id', interactionId)
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setInteractions(prev => prev.map(i => i.interaction_id === interactionId ? data : i))
      }

      return data
    } catch (err) {
      console.error('Error updating interaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to update interaction')
      throw err
    }
  }

  // Delete interaction
  const deleteInteraction = async (interactionId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('interactions')
        .delete()
        .eq('interaction_id', interactionId)

      if (error) {
        throw error
      }

      setInteractions(prev => prev.filter(i => i.interaction_id !== interactionId))
    } catch (err) {
      console.error('Error deleting interaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete interaction')
      throw err
    }
  }

  // Get interaction by ID
  const getInteractionById = async (interactionId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          *,
          customer:customers(customer_id, full_name, email, phone, customer_type),
          staff:staff(staff_id, full_name, email, position, department)
        `)
        .eq('interaction_id', interactionId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching interaction by ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch interaction')
      throw err
    }
  }

  // Fetch customers for form dropdown
  const fetchCustomers = async (): Promise<Pick<Customer, 'customer_id' | 'full_name' | 'email' | 'phone' | 'customer_type' | 'status'>[]> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_id, full_name, email, phone, customer_type, status')
        .eq('status', 'active')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      throw err
    }
  }

  // Fetch staff for form dropdown
  const fetchStaff = async (): Promise<Pick<Staff, 'staff_id' | 'full_name' | 'email' | 'position' | 'department' | 'status'>[]> => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('staff_id, full_name, email, position, department, status')
        .eq('status', 'active')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching staff:', err)
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    fetchInteractions()
  }, [])

  return {
    interactions,
    loading,
    error,
    fetchInteractions,
    fetchInteractionsByCustomer,
    fetchInteractionsByStaff,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionById,
    fetchCustomers,
    fetchStaff
  }
}
