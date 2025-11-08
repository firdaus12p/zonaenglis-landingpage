-- Fix countdown_batches date columns
-- Change start_date and end_date from TIMESTAMP to DATE
-- This fixes timezone issues and ensures dates are stored correctly

USE zona_english_admin;

-- Step 1: Modify start_date column to DATE type
ALTER TABLE countdown_batches 
  MODIFY COLUMN start_date DATE NOT NULL;

-- Step 2: Modify end_date column to DATE type (allow NULL since it's optional)
ALTER TABLE countdown_batches 
  MODIFY COLUMN end_date DATE DEFAULT NULL;

-- Step 3: Modify registration_deadline to DATE (not TIMESTAMP)
ALTER TABLE countdown_batches 
  MODIFY COLUMN registration_deadline DATE DEFAULT NULL;

-- Verify the changes
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zona_english_admin' 
  AND TABLE_NAME = 'countdown_batches'
  AND COLUMN_NAME IN ('start_date', 'end_date', 'registration_deadline', 'start_time', 'end_time');
