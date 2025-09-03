import { useState } from 'react';
import { calculateNumerologyData } from '@/lib/numerology';
import { CustomerFormData, NumerologyPreview } from './types';

export function useNumerology(formData: CustomerFormData, onChange: (data: Partial<CustomerFormData>) => void) {
  const [showNumerologyInfo, setShowNumerologyInfo] = useState(false);
  const [isCalculatingNumerology, setIsCalculatingNumerology] = useState(false);

  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true;
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const getQuickPreview = (): NumerologyPreview | null => {
    if (!formData.full_name || !formData.date_of_birth) return null;
    
    try {
      const [day, month, year] = formData.date_of_birth.split('/');
      if (!day || !month || !year) return null;
      
      if (!validateDateFormat(formData.date_of_birth)) return null;
      
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const numerologyData = calculateNumerologyData(formData.full_name, birthDate);
      
      return {
        walksOfLife: String(numerologyData.walksOfLife || numerologyData.duongdoi || 'N/A'),
        mission: String(numerologyData.mission || numerologyData.sumeng || 'N/A'),
        soul: String(numerologyData.soul || numerologyData.linhhon || 'N/A'),
        birthDate: String(numerologyData.birthDate || numerologyData.ngaysinh || 'N/A')
      };
    } catch {
      return null;
    }
  };

  const autoCalculateNumerology = async () => {
    if (!formData.full_name || !formData.date_of_birth) {
      alert('Vui lòng nhập đầy đủ Họ Tên và Ngày Sinh để tính toán thần số học');
      return;
    }

    setIsCalculatingNumerology(true);
    
    try {
      const [day, month, year] = formData.date_of_birth.split('/');
      if (!day || !month || !year) {
        throw new Error('Invalid date format');
      }
      
      const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      // Simulate calculation time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const numerologyData = calculateNumerologyData(formData.full_name, birthDate);
      
      const simplifiedData = {
        walksOfLife: numerologyData.walksOfLife || numerologyData.duongdoi,
        mission: numerologyData.mission || numerologyData.sumeng,
        soul: numerologyData.soul || numerologyData.linhhon,
        personality: numerologyData.personality || numerologyData.nhancach,
        passion: numerologyData.passion || numerologyData.damme,
        connect: numerologyData.connect || numerologyData.cauno,
        balance: numerologyData.balance || numerologyData.canbangtrongkhokhan,
        birthDate: numerologyData.birthDate || numerologyData.ngaysinh,
        attitude: numerologyData.attitude || numerologyData.thaido,
        maturity: numerologyData.maturity || numerologyData.truongthanh,
        missingNumbers: numerologyData.missingNumbers || numerologyData.sothieu || [],
        yearIndividual: numerologyData.yearIndividual || numerologyData.namcanhan,
        monthIndividual: numerologyData.monthIndividual || numerologyData.thangcanhan,
        calculatedAt: new Date().toISOString(),
        note: `Tính toán tự động cho ${formData.full_name} sinh ngày ${formData.date_of_birth}`,
        _fullData: numerologyData
      };
      
      onChange({ 
        numerology_data: simplifiedData as Record<string, unknown>
      });
      
      alert('✅ Đã tính toán thành công dữ liệu thần số học!');
    } catch (error) {
      console.error('Error calculating numerology:', error);
      alert('❌ Có lỗi xảy ra khi tính toán thần số học. Vui lòng kiểm tra lại định dạng ngày sinh.');
    } finally {
      setIsCalculatingNumerology(false);
    }
  };

  return {
    showNumerologyInfo,
    setShowNumerologyInfo,
    isCalculatingNumerology,
    getQuickPreview,
    autoCalculateNumerology
  };
}