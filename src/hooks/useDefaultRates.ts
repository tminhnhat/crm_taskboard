'use client'

import { useState, useEffect } from 'react'
import { DefaultRates, getDefaultRates, saveDefaultRates } from '@/lib/defaultRates'

/**
 * Custom hook for managing default rates (FTP and liquidity cost)
 * Syncs with localStorage and listens for changes across tabs
 */
export function useDefaultRates() {
  const [rates, setRates] = useState<DefaultRates>(getDefaultRates())

  useEffect(() => {
    // Load rates on mount
    setRates(getDefaultRates())

    // Listen for rate changes from other components/tabs
    const handleRatesChanged = (event: CustomEvent<DefaultRates>) => {
      setRates(event.detail)
    }

    const handleStorageChanged = () => {
      setRates(getDefaultRates())
    }

    window.addEventListener('default-rates-changed', handleRatesChanged as EventListener)
    window.addEventListener('storage', handleStorageChanged)

    return () => {
      window.removeEventListener('default-rates-changed', handleRatesChanged as EventListener)
      window.removeEventListener('storage', handleStorageChanged)
    }
  }, [])

  const updateRates = (newRates: DefaultRates): boolean => {
    const success = saveDefaultRates(newRates)
    if (success) {
      setRates(newRates)
    }
    return success
  }

  return {
    rates,
    updateRates
  }
}
