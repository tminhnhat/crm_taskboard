import { toVNDate, toISODate, isValidDate } from '@/lib/date';

export function useDateFormatting() {
  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      return toVNDate(dateString);
    } catch {
      return '';
    }
  };

  const formatDateForSubmission = (displayDate: string): string | null => {
    if (!displayDate) return null;
    try {
      return toISODate(displayDate);
    } catch {
      // If the utility function fails, try manual conversion
      try {
        const parts = displayDate.split('/');
        if (parts.length !== 3) return null;
        
        const [day, month, year] = parts;
        
        // Validate the parts before creating the date string
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null;
        if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) return null;
        
        // Ensure proper zero-padding for single digit days and months
        const paddedDay = day.padStart(2, '0');
        const paddedMonth = month.padStart(2, '0');
        
        // Return the date in yyyy-mm-dd format (ISO date string format)
        return `${year}-${paddedMonth}-${paddedDay}`;
      } catch {
        return null;
      }
    }
  };

  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true; // Empty is valid
    return isValidDate(dateString);
  };

  const handleDateChange = (field: string, value: string, onChange: (data: any) => void) => {
    let formattedValue = value.replace(/\D/g, ''); // Remove all non-digits
    
    // Format as user types: dd/mm/yyyy
    if (formattedValue.length >= 2) {
      formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
    }
    if (formattedValue.length >= 5) {
      formattedValue = formattedValue.substring(0, 5) + '/' + formattedValue.substring(5, 9);
    }
    
    onChange({ [field]: formattedValue });
  };

  return {
    formatDateForDisplay,
    formatDateForSubmission,
    validateDateFormat,
    handleDateChange
  };
}