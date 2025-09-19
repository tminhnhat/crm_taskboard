# Credit Assessment Form Improvements

## 1. Dynamic Collateral Template Implementation

### Problem
The collateral template in CreditAssessmentForm was showing all fields regardless of the asset type, which could be confusing for users filling out forms with irrelevant fields.

### Solution
Implemented a dynamic template system similar to CollateralForm that shows only relevant fields based on the collateral type:

#### Changes Made:

1. **Refactored COLLATERAL_TEMPLATE**: Split the monolithic template into modular components:
   - `BASE_COLLATERAL_FIELDS`: Common fields for all asset types
   - `REAL_ESTATE_FIELDS`: Fields specific to real estate (GCN, thửa đất, etc.)
   - `VEHICLE_FIELDS`: Fields specific to vehicles (biển số, số khung, etc.)
   - `FINANCIAL_FIELDS`: Fields specific to financial assets (account info, etc.)
   - `LEGAL_ASSESSMENT_FIELDS`: Common legal and assessment fields

2. **Added Dynamic Template Function**: `getCollateralTemplate(collateralType)` that:
   - Takes a collateral type string
   - Normalizes the type (converts to lowercase)
   - Returns appropriate field combinations based on type matching
   - Supports Vietnamese and English type names

3. **Updated Rendering Logic**: Modified the MetadataSection rendering to:
   - Check if the section is `collateral_info`
   - Use the dynamic template for collateral sections
   - Use the existing template for other sections
   - Maintain proper key generation for React rendering

#### Supported Asset Types:
- **Real Estate** (Bất động sản): Shows property certificate, land info, building details
- **Vehicle** (Phương tiện): Shows vehicle registration, chassis/engine numbers
- **Financial Assets** (Tài sản tài chính): Shows account details, bank information
- **Default**: Shows base fields + legal/assessment fields

#### Benefits:
- ✅ Cleaner, more focused forms
- ✅ Better user experience
- ✅ Reduced form clutter
- ✅ Consistent with CollateralForm behavior

## 2. Document Placeholder Reference File

### Problem
Template creators need a comprehensive reference of all available variable placeholders for DOCX and XLSX templates.

### Solution
Created `/src/lib/documentPlaceholders.ts` - a comprehensive documentation file containing:

#### File Structure:
- **Type Definitions**: Interfaces for placeholders and categories
- **Organized Categories**: Grouped placeholders by data source
- **Helper Functions**: Utilities for working with placeholders
- **Usage Examples**: Sample code for template creators

#### Placeholder Categories:

1. **Customer Information (Thông tin khách hàng)**
   - Personal details: `{{customer_name}}`, `{{id_number}}`, `{{phone}}`
   - Contact info: `{{email}}`, `{{address}}`
   - Business info: `{{company_name}}`, `{{business_registration_number}}`

2. **Collateral Information (Thông tin tài sản thế chấp)**
   - Basic info: `{{collateral_type}}`, `{{collateral_value}}`
   - Assessment: `{{appraised_value}}`, `{{market_value}}`
   - Legal: `{{ownership_status}}`, `{{legal_status}}`

3. **Credit Assessment Information (Thông tin thẩm định tín dụng)**
   - Loan details: `{{loan_amount}}`, `{{interest_rate}}`, `{{loan_term}}`
   - Process info: `{{assessment_id}}`, `{{department}}`, `{{status}}`
   - Formatted values: `{{loan_amount_formatted}}`, `{{loan_amount_number}}`

4. **System Information (Thông tin hệ thống)**
   - Date/time: `{{current_date}}`, `{{current_year}}`, `{{current_month}}`

5. **Real Estate Metadata (Metadata bất động sản)**
   - Property certificate: `{{so_gcn}}`, `{{ngay_cap_gcn}}`, `{{noi_cap_gcn}}`
   - Land info: `{{so_thua}}`, `{{to_ban_do}}`, `{{dien_tich}}`
   - Building info: `{{dien_tich_xay_dung}}`, `{{ket_cau}}`, `{{so_tang}}`
   - Values: `{{tong_gia_tri_tsbd}}`, `{{tong_gia_tri_dat}}`

6. **Vehicle Metadata (Metadata phương tiện)**
   - Vehicle info: `{{vehicle_type}}`, `{{brand}}`, `{{model}}`, `{{year}}`
   - Registration: `{{license_plate}}`, `{{chassis_number}}`, `{{engine_number}}`

7. **Financial Asset Metadata (Metadata tài sản tài chính)**
   - Account info: `{{account_type}}`, `{{bank_name}}`, `{{account_number}}`
   - Values: `{{balance}}`, `{{currency}}`, `{{maturity_date}}`

#### Helper Functions:
- `getPlaceholderByKey(key)`: Find specific placeholder info
- `getPlaceholdersBySource(source)`: Get placeholders by data source
- `generatePlaceholderMap()`: Create template replacement map
- `USAGE_EXAMPLES`: Sample usage for DOCX and XLSX

#### Benefits:
- ✅ Complete documentation for template creators
- ✅ Consistent naming conventions
- ✅ Clear examples and descriptions
- ✅ TypeScript support with proper types
- ✅ Easy to extend with new placeholders

## Technical Implementation Details

### File Changes:
1. **Modified**: `src/components/CreditAssessmentForm.tsx`
   - Added modular field definitions
   - Implemented dynamic template function
   - Updated rendering logic for collateral sections

2. **Created**: `src/lib/documentPlaceholders.ts`
   - Comprehensive placeholder documentation
   - Type-safe interfaces
   - Helper utilities
   - Usage examples

### Integration Points:
- Works with existing `documentService.ts`
- Compatible with current template structure
- Maintains backward compatibility
- Ready for use in template management UI

### Next Steps:
1. Template creators can now reference `documentPlaceholders.ts` for available variables
2. The dynamic collateral form will show relevant fields based on asset type
3. Future enhancements can extend the placeholder system
4. Template management UI can use the helper functions for validation