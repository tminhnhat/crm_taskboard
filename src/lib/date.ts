/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Converts a date string from dd/mm/yyyy format to ISO format (yyyy-mm-dd)
 * @param dateStr Date string in dd/mm/yyyy format
 * @returns ISO format date string (yyyy-mm-dd)
 */
export function toISODate(dateStr: string): string {
  if (!dateStr.includes('/')) {
    // Already in ISO format
    return dateStr;
  }

  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) {
    throw new Error('Định dạng ngày sinh không hợp lệ');
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Converts a date string from ISO format (yyyy-mm-dd) to Vietnamese format (dd/mm/yyyy)
 * @param isoDate Date string in ISO format
 * @returns Date string in dd/mm/yyyy format
 */
export function toVNDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Validates if a string is a valid date in either ISO or Vietnamese format
 * @param dateStr Date string to validate
 * @returns boolean indicating if the date is valid
 */
export function isValidDate(dateStr: string): boolean {
  try {
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
    } else {
      const date = new Date(dateStr);
      return date.toString() !== 'Invalid Date';
    }
  } catch {
    return false;
  }
}

/**
 * Extracts day, month, and year from a date string in either format
 * @param dateStr Date string in either ISO or Vietnamese format
 * @returns Object containing day, month, and year
 */
export function getDateParts(dateStr: string): { day: number; month: number; year: number } {
  const isoDate = dateStr.includes('/') ? toISODate(dateStr) : dateStr;
  const date = new Date(isoDate);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  };
}
