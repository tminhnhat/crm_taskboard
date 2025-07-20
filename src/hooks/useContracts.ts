'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contract, Customer, Product, Staff } from '@/lib/supabase'

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all contracts with related data
  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          signed_by_staff:staff!contracts_signed_by_fkey(*)
        `)
        .order('contract_number', { ascending: true })

      if (error) {
        throw error
      }

      setContracts(data || [])
    } catch (err) {
      console.error('Error fetching contracts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts')
    } finally {
      setLoading(false)
    }
  }

  // Create new contract
  const createContract = async (contractData: Partial<Contract>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          signed_by_staff:staff!contracts_signed_by_fkey(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setContracts(prev => [data, ...prev])
      }

      return data
    } catch (err) {
      console.error('Error creating contract:', err)
      setError(err instanceof Error ? err.message : 'Failed to create contract')
      throw err
    }
  }

  // Update contract
  const updateContract = async (contractId: number, updates: Partial<Contract>) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('contract_id', contractId)
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          signed_by_staff:staff!contracts_signed_by_fkey(*)
        `)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        setContracts(prev => prev.map(c => c.contract_id === contractId ? data : c))
      }

      return data
    } catch (err) {
      console.error('Error updating contract:', err)
      setError(err instanceof Error ? err.message : 'Failed to update contract')
      throw err
    }
  }

  // Delete contract
  const deleteContract = async (contractId: number) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('contract_id', contractId)

      if (error) {
        throw error
      }

      setContracts(prev => prev.filter(c => c.contract_id !== contractId))
    } catch (err) {
      console.error('Error deleting contract:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete contract')
      throw err
    }
  }

  // Get contract by ID
  const getContractById = async (contractId: number) => {
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          customer:customers(*),
          product:products(*),
          signed_by_staff:staff!contracts_signed_by_fkey(*)
        `)
        .eq('contract_id', contractId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching contract by ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contract')
      throw err
    }
  }

  // Check if contract number exists
  const checkContractNumberExists = async (contractNumber: string, excludeId?: number) => {
    try {
      let query = supabase
        .from('contracts')
        .select('contract_id')
        .eq('contract_number', contractNumber)

      if (excludeId) {
        query = query.neq('contract_id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data && data.length > 0
    } catch (err) {
      console.error('Error checking contract number:', err)
      return false
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
    fetchContracts()
  }, [])

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    getContractById,
    checkContractNumberExists,
    fetchCustomers,
    fetchProducts,
    fetchStaff
  }
}
