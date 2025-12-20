/**
 * Default Rates Configuration Utilities
 * 
 * Manages default rates for FTP (Fund Transfer Pricing) and liquidity costs.
 * These rates are used as defaults when creating new contracts.
 * Rates are stored in localStorage and can be configured from settings.
 */

export interface DefaultRates {
  ftpLending: number      // FTP rate for lending (giá bán vốn) in percentage
  ftpDeposit: number      // FTP rate for deposits (giá mua vốn) in percentage
  liquidityCost: number   // Liquidity cost (chi phí thanh khoản) in percentage
}

const DEFAULT_RATES: DefaultRates = {
  ftpLending: 8.0,      // 8%
  ftpDeposit: 6.0,      // 6%
  liquidityCost: 1.0    // 1%
}

const DEFAULT_RATES_STORAGE_KEY = 'default_rates'

/**
 * Get default rates from localStorage or return defaults
 */
export function getDefaultRates(): DefaultRates {
  if (typeof window === 'undefined') {
    return DEFAULT_RATES
  }

  try {
    const stored = localStorage.getItem(DEFAULT_RATES_STORAGE_KEY)
    if (stored) {
      const rates = JSON.parse(stored) as DefaultRates
      // Validate rates are positive
      if (rates.ftpLending >= 0 && rates.ftpDeposit >= 0 && rates.liquidityCost >= 0) {
        return rates
      }
    }
  } catch (error) {
    console.error('Error loading default rates:', error)
  }

  return DEFAULT_RATES
}

/**
 * Save default rates to localStorage
 */
export function saveDefaultRates(rates: DefaultRates): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // Validate that all rates are non-negative
    if (rates.ftpLending < 0 || rates.ftpDeposit < 0 || rates.liquidityCost < 0) {
      console.error('Default rates must be non-negative')
      return false
    }

    localStorage.setItem(DEFAULT_RATES_STORAGE_KEY, JSON.stringify(rates))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('default-rates-changed', { detail: rates }))
    
    return true
  } catch (error) {
    console.error('Error saving default rates:', error)
    return false
  }
}

/**
 * Reset default rates to system defaults
 */
export function resetDefaultRates(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(DEFAULT_RATES_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('default-rates-changed', { detail: DEFAULT_RATES }))
  } catch (error) {
    console.error('Error resetting default rates:', error)
  }
}

/**
 * Get system default rates
 */
export function getSystemDefaultRates(): DefaultRates {
  return { ...DEFAULT_RATES }
}
