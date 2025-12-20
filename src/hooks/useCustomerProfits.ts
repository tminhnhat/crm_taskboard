'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contract, CreditAssessment, Customer } from '@/lib/supabase'
import { calculateCustomerProfitability } from '@/lib/profitCalculation'

export interface CustomerProfitData {
  customerId: number
  customerName: string
  totalLendingProfit: number
  totalCapitalMobilizationProfit: number
  totalFeeProfit: number
  totalProfit: number
  contractCount: number
  profitByContract: Array<{
    contractId: number
    contractNumber: string
    lendingProfit: number
    capitalMobilizationProfit: number
    feeProfit: number
    totalProfit: number
  }>
}

export function useCustomerProfits(customerId?: number) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [assessments, setAssessments] = useState<CreditAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch contracts and assessments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch contracts with related data
        let contractQuery = supabase
          .from('contracts')
          .select(`
            *,
            customer:customers(*),
            product:products(*),
            signed_by_staff:staff!contracts_signed_by_fkey(*)
          `)

        if (customerId) {
          contractQuery = contractQuery.eq('customer_id', customerId)
        }

        const { data: contractsData, error: contractsError } = await contractQuery

        if (contractsError) throw contractsError

        // Fetch credit assessments
        let assessmentQuery = supabase
          .from('credit_assessments')
          .select('*')

        if (customerId) {
          assessmentQuery = assessmentQuery.eq('customer_id', customerId)
        }

        const { data: assessmentsData, error: assessmentsError } = await assessmentQuery

        if (assessmentsError) throw assessmentsError

        setContracts(contractsData || [])
        setAssessments(assessmentsData || [])
      } catch (err) {
        console.error('Error fetching profit data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch profit data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [customerId])

  // Calculate profit for a specific customer
  const getCustomerProfit = (customerId: number): CustomerProfitData | null => {
    const customerContracts = contracts.filter(c => c.customer_id === customerId)
    const customerAssessments = assessments.filter(a => a.customer_id === customerId)

    if (customerContracts.length === 0) {
      return null
    }

    const profitData = calculateCustomerProfitability(customerContracts, customerAssessments)
    
    const customer = customerContracts[0]?.customer

    return {
      customerId,
      customerName: customer?.full_name || 'Unknown',
      ...profitData
    }
  }

  // Calculate profits for all customers
  const allCustomerProfits = useMemo(() => {
    // Group contracts by customer
    const customerMap = new Map<number, Contract[]>()
    
    contracts.forEach(contract => {
      const existing = customerMap.get(contract.customer_id) || []
      customerMap.set(contract.customer_id, [...existing, contract])
    })

    const profitData: CustomerProfitData[] = []

    customerMap.forEach((customerContracts, custId) => {
      const customerAssessments = assessments.filter(a => a.customer_id === custId)
      const profitCalc = calculateCustomerProfitability(customerContracts, customerAssessments)
      
      const customer = customerContracts[0]?.customer

      profitData.push({
        customerId: custId,
        customerName: customer?.full_name || 'Unknown',
        ...profitCalc
      })
    })

    // Sort by total profit descending
    return profitData.sort((a, b) => b.totalProfit - a.totalProfit)
  }, [contracts, assessments])

  // Get top profitable customers
  const getTopProfitableCustomers = (limit: number = 10): CustomerProfitData[] => {
    return allCustomerProfits.slice(0, limit)
  }

  // Get total profit across all customers
  const totalProfitAcrossAllCustomers = useMemo(() => {
    return allCustomerProfits.reduce((sum, customer) => sum + customer.totalProfit, 0)
  }, [allCustomerProfits])

  return {
    loading,
    error,
    contracts,
    assessments,
    getCustomerProfit,
    allCustomerProfits,
    getTopProfitableCustomers,
    totalProfitAcrossAllCustomers
  }
}
