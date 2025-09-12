-- ===================================================================
-- Add "ngày đánh giá lại tài sản" (re-evaluation date) column to collaterals table
-- ===================================================================

-- Add the new column to the collaterals table
ALTER TABLE collaterals 
ADD COLUMN IF NOT EXISTS re_evaluation_date DATE COMMENT 'Ngày đánh giá lại tài sản';

-- Create an index on the new column for better query performance
CREATE INDEX IF NOT EXISTS idx_collaterals_re_evaluation_date 
ON collaterals(re_evaluation_date);

-- Update existing records to set a default re-evaluation date 
-- (1 year from appraisal_date or current date if no appraisal_date)
UPDATE collaterals 
SET re_evaluation_date = COALESCE(
    appraisal_date + INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '1 year'
)
WHERE re_evaluation_date IS NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN collaterals.re_evaluation_date IS 'Ngày đánh giá lại tài sản - thời điểm cần thẩm định lại giá trị tài sản';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully added re_evaluation_date column to collaterals table';
    RAISE NOTICE 'Column: re_evaluation_date (DATE) - Ngày đánh giá lại tài sản';
    RAISE NOTICE 'Index created: idx_collaterals_re_evaluation_date';
    RAISE NOTICE 'Existing records updated with default values';
END $$;