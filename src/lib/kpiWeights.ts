/**
 * KPI Weights Configuration Utilities
 * 
 * Manages KPI weights for profit calculation across the application.
 * Weights are stored in localStorage and can be configured from settings.
 */

export interface KPIWeights {
  lending: number        // Weight for lending profit (0-1)
  mobilization: number   // Weight for capital mobilization profit (0-1)
  fees: number          // Weight for fee profit (0-1)
}

const DEFAULT_KPI_WEIGHTS: KPIWeights = {
  lending: 0.4,      // 40%
  mobilization: 0.4, // 40%
  fees: 0.2          // 20%
}

const KPI_WEIGHTS_STORAGE_KEY = 'kpi_weights'

/**
 * Get KPI weights from localStorage or return defaults
 */
export function getKPIWeights(): KPIWeights {
  if (typeof window === 'undefined') {
    return DEFAULT_KPI_WEIGHTS
  }

  try {
    const stored = localStorage.getItem(KPI_WEIGHTS_STORAGE_KEY)
    if (stored) {
      const weights = JSON.parse(stored) as KPIWeights
      // Validate that weights sum to 1.0 (100%)
      const sum = weights.lending + weights.mobilization + weights.fees
      if (Math.abs(sum - 1.0) < 0.001) {
        return weights
      }
    }
  } catch (error) {
    console.error('Error loading KPI weights:', error)
  }

  return DEFAULT_KPI_WEIGHTS
}

/**
 * Save KPI weights to localStorage
 */
export function saveKPIWeights(weights: KPIWeights): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    // Validate that weights sum to 1.0 (100%)
    const sum = weights.lending + weights.mobilization + weights.fees
    if (Math.abs(sum - 1.0) > 0.001) {
      console.error('KPI weights must sum to 100%')
      return false
    }

    // Validate that all weights are between 0 and 1
    if (weights.lending < 0 || weights.lending > 1 ||
        weights.mobilization < 0 || weights.mobilization > 1 ||
        weights.fees < 0 || weights.fees > 1) {
      console.error('KPI weights must be between 0 and 100%')
      return false
    }

    localStorage.setItem(KPI_WEIGHTS_STORAGE_KEY, JSON.stringify(weights))
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('kpi-weights-changed', { detail: weights }))
    
    return true
  } catch (error) {
    console.error('Error saving KPI weights:', error)
    return false
  }
}

/**
 * Reset KPI weights to defaults
 */
export function resetKPIWeights(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(KPI_WEIGHTS_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('kpi-weights-changed', { detail: DEFAULT_KPI_WEIGHTS }))
  } catch (error) {
    console.error('Error resetting KPI weights:', error)
  }
}

/**
 * Get default KPI weights
 */
export function getDefaultKPIWeights(): KPIWeights {
  return { ...DEFAULT_KPI_WEIGHTS }
}

/**
 * Convert weight to percentage (0.4 -> 40)
 */
export function weightToPercentage(weight: number): number {
  return Math.round(weight * 100)
}

/**
 * Convert percentage to weight (40 -> 0.4)
 */
export function percentageToWeight(percentage: number): number {
  return percentage / 100
}
