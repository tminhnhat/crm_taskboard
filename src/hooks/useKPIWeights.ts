'use client'

import { useState, useEffect } from 'react'
import { KPIWeights, getKPIWeights, saveKPIWeights } from '@/lib/kpiWeights'

/**
 * Custom hook for managing KPI weights
 * Syncs with localStorage and listens for changes across tabs
 */
export function useKPIWeights() {
  const [weights, setWeights] = useState<KPIWeights>(getKPIWeights())

  useEffect(() => {
    // Load weights on mount
    setWeights(getKPIWeights())

    // Listen for weight changes from other components/tabs
    const handleWeightsChanged = (event: CustomEvent<KPIWeights>) => {
      setWeights(event.detail)
    }

    const handleStorageChanged = () => {
      setWeights(getKPIWeights())
    }

    window.addEventListener('kpi-weights-changed', handleWeightsChanged as EventListener)
    window.addEventListener('storage', handleStorageChanged)

    return () => {
      window.removeEventListener('kpi-weights-changed', handleWeightsChanged as EventListener)
      window.removeEventListener('storage', handleStorageChanged)
    }
  }, [])

  const updateWeights = (newWeights: KPIWeights): boolean => {
    const success = saveKPIWeights(newWeights)
    if (success) {
      setWeights(newWeights)
    }
    return success
  }

  return {
    weights,
    updateWeights
  }
}
