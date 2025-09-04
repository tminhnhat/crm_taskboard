// Main modular CustomerForm component
export { default as CustomerForm } from './CustomerFormModular';

// Individual section components for reuse
export { default as CustomerBasicInfoSection } from './CustomerBasicInfoSection';
export { default as CustomerAccountSection } from './CustomerAccountSection';
export { default as CustomerContactSection } from './CustomerContactSection';
export { default as CustomerBusinessSection } from './CustomerBusinessSection';
export { default as CustomerPersonalInfoSection } from './CustomerPersonalInfoSection';
export { default as CustomerNumerologySection } from './CustomerNumerologySection';
export { default as CustomerRelationshipSection } from './CustomerRelationshipSection';
export { default as CustomerQRScannerSection } from './CustomerQRScannerSection';

// Hooks and utilities
export { useNumerology } from './useNumerology';
export { useDateFormatting } from './useDateFormatting';

// Types
export type { 
  CustomerFormData, 
  CustomerFormSectionProps, 
  CustomerFormProps, 
  NumerologyPreview 
} from './types';