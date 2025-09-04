import { useState, useCallback } from 'react'

export function useDateFormatting() {
  const formatDateForDisplay = useCallback((dateString: string | null): string => {
    if (!dateString) return ''
    
    // If already in dd/mm/yyyy format, return as is
    if (dateString.includes('/')) return dateString
    
    // Convert from yyyy-mm-dd to dd/mm/yyyy
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return ''
    
    const [, year, month, day] = dateMatch
    return `${day}/${month}/${year}`
  }, [])

  const formatDateForSubmission = useCallback((displayDate: string): string | null => {
    if (!displayDate) return null
    
    // If already in yyyy-mm-dd format, return as is
    if (displayDate.includes('-') && displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) return displayDate
    
    // Convert from dd/mm/yyyy to yyyy-mm-dd
    const parts = displayDate.split('/')
    if (parts.length !== 3) return null
    
    const [day, month, year] = parts
    
    // Validate the parts before creating the date string
    const dayNum = parseInt(day)
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null
    
    // Ensure proper zero-padding for single digit days and months
    const paddedDay = day.padStart(2, '0')
    const paddedMonth = month.padStart(2, '0')
    
    // Return the date in yyyy-mm-dd format (ISO date string format)
    return `${year}-${paddedMonth}-${paddedDay}`
  }, [])

  const validateDateFormat = useCallback((dateString: string): boolean => {
    if (!dateString) return true // Empty is valid
    
    const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = dateString.match(ddmmyyyyPattern)
    
    if (!match) return false
    
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    
    // Basic validation
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false
    if (year < 1900 || year > new Date().getFullYear() + 50) return false
    
    // More precise date validation - check if the date actually exists
    const testDate = new Date(year, month - 1, day)
    return testDate.getDate() === day && 
           testDate.getMonth() === month - 1 && 
           testDate.getFullYear() === year
  }, [])

  return {
    formatDateForDisplay,
    formatDateForSubmission, 
    validateDateFormat
  }
}