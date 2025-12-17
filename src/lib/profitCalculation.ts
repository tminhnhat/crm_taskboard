/**
 * Profit Calculation Utilities
 * 
 * This module provides functions to calculate profitability from customers
 * based on their contracts and credit assessments.
 */

import { Contract, CreditAssessment, Product } from './supabase'

/**
 * Calculate the number of months between two dates
 */
function calculateMonthsDifference(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth())
  
  return Math.max(0, months)
}

/**
 * Calculate profit from lending activities
 * Profit = Loan Amount × Interest Rate × (Term in months / 12)
 */
export function calculateLendingProfit(
  contract: Contract,
  assessment?: CreditAssessment
): number {
  // Get loan amount from contract or assessment
  const loanAmount = assessment?.loan_info?.amount?.approved || 
                     assessment?.loan_info?.amount?.disbursement ||
                     contract.contract_credit_limit || 
                     0

  // Get interest rate from assessment or product
  const interestRate = (assessment?.loan_info?.interest?.final_rate || 
                       contract.product?.interest_rate || 
                       0) / 100 // Convert percentage to decimal

  // Get term from assessment or calculate from contract dates
  let termMonths = assessment?.loan_info?.term?.approved_months || 0
  
  if (!termMonths && contract.start_date && contract.end_date) {
    termMonths = calculateMonthsDifference(contract.start_date, contract.end_date)
  }

  // Calculate profit: Principal × Rate × Time (in years)
  const profit = loanAmount * interestRate * (termMonths / 12)
  
  return Math.round(profit)
}

/**
 * Calculate profit from capital mobilization (deposits)
 * This assumes the bank uses customer deposits to lend at a higher rate
 * Profit = Deposit Amount × (Lending Rate - Deposit Rate) × (Term / 12)
 * 
 * Note: For simplicity, we use a spread assumption if deposit rate is not available
 */
export function calculateCapitalMobilizationProfit(
  contract: Contract,
  assessment?: CreditAssessment
): number {
  // Only calculate for deposit products
  const productType = contract.product?.product_type?.toLowerCase() || ''
  
  if (!productType.includes('deposit') && 
      !productType.includes('tiền gửi') && 
      !productType.includes('tien gui') &&
      !productType.includes('huy động') &&
      !productType.includes('huy dong')) {
    return 0
  }

  // Get deposit amount
  const depositAmount = contract.contract_credit_limit || 0

  // Get deposit rate from product
  const depositRate = (contract.product?.interest_rate || 0) / 100

  // Assume a lending spread (typically 2-4% higher than deposit rate)
  // In a real system, this would come from actual lending rates
  const lendingSpread = 0.03 // 3% spread assumption

  // Calculate term
  let termMonths = 0
  if (contract.start_date && contract.end_date) {
    termMonths = calculateMonthsDifference(contract.start_date, contract.end_date)
  }

  // Profit = Amount × Spread × Time
  const profit = depositAmount * lendingSpread * (termMonths / 12)
  
  return Math.round(profit)
}

/**
 * Calculate profit from fee collection
 * This includes all fees from contracts and credit assessments
 */
export function calculateFeeProfit(
  contract: Contract,
  assessment?: CreditAssessment
): number {
  let totalFees = 0

  // Add fee from credit assessment
  if (assessment?.fee_amount) {
    totalFees += assessment.fee_amount
  }

  // Add fees from product
  if (contract.product?.fees) {
    totalFees += contract.product.fees
  }

  // Add fees from loan_info if available
  if (assessment?.loan_info?.fees && Array.isArray(assessment.loan_info.fees)) {
    assessment.loan_info.fees.forEach(fee => {
      if (fee.amount) {
        totalFees += fee.amount
      }
    })
  }

  return Math.round(totalFees)
}

/**
 * Calculate total profit from a single contract
 */
export function calculateContractProfit(
  contract: Contract,
  assessment?: CreditAssessment
): {
  lendingProfit: number
  capitalMobilizationProfit: number
  feeProfit: number
  totalProfit: number
} {
  const lendingProfit = calculateLendingProfit(contract, assessment)
  const capitalMobilizationProfit = calculateCapitalMobilizationProfit(contract, assessment)
  const feeProfit = calculateFeeProfit(contract, assessment)
  
  return {
    lendingProfit,
    capitalMobilizationProfit,
    feeProfit,
    totalProfit: lendingProfit + capitalMobilizationProfit + feeProfit
  }
}

/**
 * Calculate total profitability for a customer from all their contracts
 */
export function calculateCustomerProfitability(
  contracts: Contract[],
  assessments: CreditAssessment[] = []
): {
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
} {
  let totalLendingProfit = 0
  let totalCapitalMobilizationProfit = 0
  let totalFeeProfit = 0
  const profitByContract: Array<{
    contractId: number
    contractNumber: string
    lendingProfit: number
    capitalMobilizationProfit: number
    feeProfit: number
    totalProfit: number
  }> = []

  contracts.forEach(contract => {
    // Find related assessment
    const assessment = assessments.find(a => a.customer_id === contract.customer_id)
    
    const contractProfit = calculateContractProfit(contract, assessment)
    
    totalLendingProfit += contractProfit.lendingProfit
    totalCapitalMobilizationProfit += contractProfit.capitalMobilizationProfit
    totalFeeProfit += contractProfit.feeProfit
    
    profitByContract.push({
      contractId: contract.contract_id,
      contractNumber: contract.contract_number,
      lendingProfit: contractProfit.lendingProfit,
      capitalMobilizationProfit: contractProfit.capitalMobilizationProfit,
      feeProfit: contractProfit.feeProfit,
      totalProfit: contractProfit.totalProfit
    })
  })

  return {
    totalLendingProfit,
    totalCapitalMobilizationProfit,
    totalFeeProfit,
    totalProfit: totalLendingProfit + totalCapitalMobilizationProfit + totalFeeProfit,
    contractCount: contracts.length,
    profitByContract
  }
}

/**
 * Format currency in Vietnamese Dong
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format profit percentage
 */
export function formatProfitPercentage(profit: number, principal: number): string {
  if (principal === 0) return '0%'
  const percentage = (profit / principal) * 100
  return `${percentage.toFixed(2)}%`
}
