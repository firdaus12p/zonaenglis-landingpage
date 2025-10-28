-- Update existing promo codes to be valid for testing
UPDATE promo_codes 
SET 
  valid_from = DATE_SUB(NOW(), INTERVAL 1 MONTH),
  valid_until = DATE_ADD(NOW(), INTERVAL 6 MONTH)
WHERE code IN ('GAJIAN90', 'EARLY50', 'STUDENT25');

-- Insert RAMADAN30 promo code
INSERT INTO promo_codes 
  (code, name, description, discount_type, discount_value, valid_from, valid_until, is_active, created_by)
VALUES 
  ('RAMADAN30', 'Promo Ramadan', 'Diskon spesial bulan Ramadan 30%', 'percentage', 30.00, 
   DATE_SUB(NOW(), INTERVAL 1 MONTH), DATE_ADD(NOW(), INTERVAL 6 MONTH), 1, 1)
ON DUPLICATE KEY UPDATE
  valid_from = DATE_SUB(NOW(), INTERVAL 1 MONTH),
  valid_until = DATE_ADD(NOW(), INTERVAL 6 MONTH),
  is_active = 1;

-- Verify updates
SELECT 
  code, 
  name, 
  discount_type, 
  discount_value,
  DATE_FORMAT(valid_from, '%Y-%m-%d') as valid_from,
  DATE_FORMAT(valid_until, '%Y-%m-%d') as valid_until,
  is_active
FROM promo_codes
ORDER BY code;
