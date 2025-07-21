# Numerology Integration Documentation

## Overview
The CRM system now includes automatic numerology calculation functionality that integrates Vietnamese name analysis with birth date calculations.

## Features

### Automatic Calculation
- **When creating customers**: Numerology data is automatically calculated when both `full_name` and `date_of_birth` are provided
- **When updating customers**: Numerology data is recalculated when either name or birth date is modified
- **Manual recalculation**: Users can manually trigger numerology recalculation using the 🔢 button in customer cards

### Numerology Data Points Calculated

The system calculates 22 different numerology values:

1. **Đường đời (Path of Life)** - Life path number based on birth date
2. **Sứ mệnh (Mission)** - Mission number from full name
3. **Linh hồn (Soul)** - Soul number from vowels in name
4. **Kết nối (Connection)** - Connection between life path and mission
5. **Nhân cách (Personality)** - Personality from consonants
6. **Đam mê (Passion)** - Passion number from complete name
7. **Trưởng thành (Mature)** - Maturity number
8. **Cân bằng (Balance)** - Balance from first letters
9. **Sức mạnh tiềm thức (Subconscious Power)** - Based on missing numbers
10. **Số thiếu (Missing Numbers)** - Numbers not present in name
11. **Tư duy lý trí (Rational Thinking)** - Rational thinking calculation
12. **Chặng (Way)** - Life stages/ways
13. **Thách thức (Challenges)** - Life challenges
14. **Ngày sinh (Date of Birth)** - Birth date number
15. **Năm cá nhân (Individual Year)** - Current personal year
16. **Năm cá nhân + 1** - Next personal year
17. **Năm cá nhân + 2** - Following personal year
18. **Tháng cá nhân (Individual Month)** - Current personal month
19. **Tháng cá nhân + 1** - Next personal month
20. **Tháng cá nhân + 2** - Following personal month  
21. **Tháng cá nhân + 3** - Third following personal month
22. **Liên kết nhân cách và linh hồn** - Link between personality and soul

## Technical Implementation

### Files Modified/Created
- `src/lib/numerology.ts` - Core numerology calculation engine
- `src/hooks/useCustomers.ts` - Updated to include auto-calculation
- `src/components/CustomerForm.tsx` - Added user notification about auto-calculation
- `src/components/CustomerCard.tsx` - Added manual recalculation button
- `src/app/customers/page.tsx` - Integration with customer management

### Vietnamese Language Support
- Full Vietnamese accent removal and normalization
- Proper handling of Vietnamese names with multiple words
- Accurate consonant/vowel classification for Vietnamese characters

### Data Storage
- Numerology data is stored in the `numerology_data` JSONB field in the customers table
- Data includes both simplified key-value pairs and detailed calculation results
- Timestamp of calculation is included for audit purposes

## User Interface

### Customer Form
- Blue notification box explaining automatic calculation
- Manual JSON input still available for custom data
- Auto-calculation triggers when both name and birth date are complete

### Customer Card
- 🔢 button appears when customer has both name and birth date
- Button tooltip: "Tính lại thần số học"
- Only visible when recalculation function is available

### Customer Management
- Automatic calculation on create/update
- Manual recalculation with success/error notifications
- Full integration with existing customer workflow

## Usage Examples

### Automatic Calculation
```typescript
// When creating a customer
const customerData = {
  full_name: "Nguyễn Thị Lan",
  date_of_birth: "1985-03-15",
  // ... other fields
}
// Numerology data will be automatically calculated and stored
```

### Manual Recalculation
```typescript
// In customer management
await recalculateNumerology(customerId)
// Updates numerology_data field with fresh calculations
```

## Benefits
1. **Automated**: No manual calculation required
2. **Accurate**: Based on established numerology principles
3. **Vietnamese-optimized**: Handles Vietnamese names correctly
4. **Flexible**: Supports both automatic and manual input
5. **Auditable**: Includes calculation timestamps
6. **User-friendly**: Clear UI indicators and notifications

## Error Handling
- Graceful handling of missing name or birth date
- Error logging for calculation failures
- Fallback to empty object if calculation fails
- User notifications for successful/failed operations
