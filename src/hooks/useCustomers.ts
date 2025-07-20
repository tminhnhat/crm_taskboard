import { useState, useEffect } from 'react'
import { supabase, Customer } from '@/lib/supabase'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Create a new customer
  const createCustomer = async (customerData: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create customer')
    }
  }

  // Update a customer
  const updateCustomer = async (id: number, updates: Partial<Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('customer_id', id)
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => prev.map(customer => customer.customer_id === id ? data : customer))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update customer')
    }
  }

  // Delete a customer
  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('customer_id', id)

      if (error) throw error
      setCustomers(prev => prev.filter(customer => customer.customer_id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete customer')
    }
  }

  // Update customer status
  const updateCustomerStatus = async (id: number, status: string) => {
    return updateCustomer(id, { status })
  }

  // Search customers by name, email, phone, account_number, or cif_number
  const searchCustomers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,account_number.ilike.%${query}%,cif_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to search customers')
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerStatus,
    searchCustomers,
    refetch: fetchCustomers
  }
}
