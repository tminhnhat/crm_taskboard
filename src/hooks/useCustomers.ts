import { useState, useEffect } from 'react'
import { supabase, Customer } from '@/lib/supabase'
import { calculateNumerologyData } from '@/lib/numerology'

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
      // Auto-calculate numerology if name and birth date are provided
      const finalCustomerData = { ...customerData }
      if (customerData.full_name && customerData.date_of_birth) {
        const numerologyData = calculateNumerologyData(customerData.full_name, customerData.date_of_birth)
        finalCustomerData.numerology_data = numerologyData
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([finalCustomerData])
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
      // Auto-calculate numerology if name or birth date are being updated
      const finalUpdates = { ...updates }
      
      // Get current customer data to have complete info for numerology calculation
      const { data: currentCustomer } = await supabase
        .from('customers')
        .select('full_name, date_of_birth')
        .eq('customer_id', id)
        .single()

      if (currentCustomer) {
        const fullName = updates.full_name || currentCustomer.full_name
        const dateOfBirth = updates.date_of_birth || currentCustomer.date_of_birth
        
        // Recalculate numerology if we have both name and birth date
        if (fullName && dateOfBirth && (updates.full_name || updates.date_of_birth)) {
          const numerologyData = calculateNumerologyData(fullName, dateOfBirth)
          finalUpdates.numerology_data = numerologyData
        }
      }

      const { data, error } = await supabase
        .from('customers')
        .update(finalUpdates)
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

  // Manually recalculate numerology for a customer
  const recalculateNumerology = async (id: number) => {
    try {
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('full_name, date_of_birth')
        .eq('customer_id', id)
        .single()

      if (fetchError) throw fetchError

      if (!customer.full_name || !customer.date_of_birth) {
        throw new Error('Customer must have both full name and date of birth to calculate numerology')
      }

      const numerologyData = calculateNumerologyData(customer.full_name, customer.date_of_birth)

      const { data, error } = await supabase
        .from('customers')
        .update({ numerology_data: numerologyData })
        .eq('customer_id', id)
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => prev.map(cust => cust.customer_id === id ? data : cust))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to recalculate numerology')
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
    recalculateNumerology,
    refetch: fetchCustomers
  }
}
