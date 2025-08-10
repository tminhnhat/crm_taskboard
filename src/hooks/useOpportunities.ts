'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Opportunity, Customer, Product, Staff } from '@/lib/supabase'

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all opportunities with related data
  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          staff:staff(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setOpportunities(data || [])
    } catch (err) {
      console.error('Error fetching opportunities:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities')
    } finally {
      setLoading(false)
    }
  }

  // Create new opportunity
  const createOpportunity = async (opportunityData: Partial<Opportunity>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert([opportunityData])
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          staff:staff(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setOpportunities(prev => [data, ...prev])
      }

      return data
    } catch (err) {
      console.error('Error creating opportunity:', err)
      setError(err instanceof Error ? err.message : 'Failed to create opportunity')
      throw err
    }
  }

  // Update opportunity
  const updateOpportunity = async (opportunityId: number, updates: Partial<Opportunity>) => {
    try {
      setError(null)
      
      // Add closed_at timestamp if status is changing to won or lost
      if (updates.status && ['won', 'lost'].includes(updates.status)) {
        updates.closed_at = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('opportunity_id', opportunityId)
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          staff:staff(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setOpportunities(prev => prev.map(o => o.opportunity_id === opportunityId ? data : o))
      }

      return data
    } catch (err) {
      console.error('Error updating opportunity:', err)
      setError(err instanceof Error ? err.message : 'Failed to update opportunity')
      throw err
    }
  }

  // Delete opportunity
  const deleteOpportunity = async (opportunityId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('opportunity_id', opportunityId)

      if (error) {
        throw error
      }

      setOpportunities(prev => prev.filter(o => o.opportunity_id !== opportunityId))
    } catch (err) {
      console.error('Error deleting opportunity:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity')
      throw err
    }
  }

  // Get opportunity by ID
  const getOpportunityById = async (opportunityId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          staff:staff(*)
        `)
        .eq('opportunity_id', opportunityId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching opportunity by ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunity')
      throw err
    }
  }

  // Fetch customers for dropdown
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
      throw err
    }
  }

  // Fetch products for dropdown
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('product_name', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Error fetching products:', err)
      throw err
    }
  }

  // Fetch staff for dropdown
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
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    fetchOpportunities()
  }, [])

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunityById,
    fetchCustomers,
    fetchProducts,
    fetchStaff
  }
}
