'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Collateral, Customer } from '@/lib/supabase'

export function useCollaterals() {
  const [collaterals, setCollaterals] = useState<Collateral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all collaterals with related data
  const fetchCollaterals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('collaterals')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('valuation_date', { ascending: false, nullsFirst: false })

      if (error) {
        throw error
      }

      setCollaterals(data || [])
    } catch (err) {
      console.error('Error fetching collaterals:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch collaterals')
    } finally {
      setLoading(false)
    }
  }

  // Create new collateral
  const createCollateral = async (collateralData: Partial<Collateral>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('collaterals')
        .insert([collateralData])
        .select(`
          *,
          customer:customers(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setCollaterals(prev => [data, ...prev])
      }
      
      return data
    } catch (err) {
      console.error('Error creating collateral:', err)
      setError(err instanceof Error ? err.message : 'Failed to create collateral')
      throw err
    }
  }

  // Update existing collateral
  const updateCollateral = async (collateralId: number, collateralData: Partial<Collateral>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('collaterals')
        .update(collateralData)
        .eq('collateral_id', collateralId)
        .select(`
          *,
          customer:customers(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setCollaterals(prev => prev.map(collateral => 
          collateral.collateral_id === collateralId ? data : collateral
        ))
      }
      
      return data
    } catch (err) {
      console.error('Error updating collateral:', err)
      setError(err instanceof Error ? err.message : 'Failed to update collateral')
      throw err
    }
  }

  // Delete collateral
  const deleteCollateral = async (collateralId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('collaterals')
        .delete()
        .eq('collateral_id', collateralId)

      if (error) {
        throw error
      }

      setCollaterals(prev => prev.filter(collateral => collateral.collateral_id !== collateralId))
    } catch (err) {
      console.error('Error deleting collateral:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete collateral')
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

  // Get collateral statistics
  const getCollateralStats = () => {
    const total = collaterals.length
    const totalValue = collaterals.reduce((sum, c) => sum + (c.value || 0), 0)
    
    const byType = collaterals.reduce((acc, c) => {
      const type = c.collateral_type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const byStatus = collaterals.reduce((acc, c) => {
      const status = c.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageValue = total > 0 ? totalValue / total : 0

    return {
      total,
      totalValue,
      averageValue,
      byType,
      byStatus,
      mostCommonType: Object.keys(byType).reduce((a, b) => byType[a] > byType[b] ? a : b, ''),
      mostCommonStatus: Object.keys(byStatus).reduce((a, b) => byStatus[a] > byStatus[b] ? a : b, '')
    }
  }

  // Initialize data
  useEffect(() => {
    fetchCollaterals()
  }, [])

  return {
    collaterals,
    loading,
    error,
    createCollateral,
    updateCollateral,
    deleteCollateral,
    fetchCustomers,
    getCollateralStats,
    refetch: fetchCollaterals
  }
}
