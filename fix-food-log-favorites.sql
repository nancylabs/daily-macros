-- Add is_favorite column to food_log table to distinguish between regular entries and favorites

-- Add the is_favorite column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'food_log' 
    AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE food_log ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index on is_favorite for better performance
CREATE INDEX IF NOT EXISTS idx_food_log_is_favorite ON food_log(is_favorite);

-- Update existing entries to mark them as not favorites (regular entries)
UPDATE food_log SET is_favorite = FALSE WHERE is_favorite IS NULL;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'food_log' 
AND table_schema = 'public'
ORDER BY ordinal_position; 