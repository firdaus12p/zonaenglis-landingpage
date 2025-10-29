-- ============================================
-- Database Verification Script
-- ============================================
-- Run this script to verify your database setup
-- for the unread badge feature

-- 1. Check if last_viewed_at column exists
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zona_english_admin'
  AND TABLE_NAME = 'ambassadors'
  AND COLUMN_NAME = 'last_viewed_at';

-- Expected result: Should return 1 row showing:
-- COLUMN_NAME: last_viewed_at
-- DATA_TYPE: timestamp
-- IS_NULLABLE: YES
-- COLUMN_COMMENT: When admin last viewed this ambassador in affiliate tracking dashboard

-- 2. Check if index exists on last_viewed_at
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'zona_english_admin'
  AND TABLE_NAME = 'ambassadors'
  AND COLUMN_NAME = 'last_viewed_at';

-- Expected result: Should return 1 row showing:
-- INDEX_NAME: idx_last_viewed
-- COLUMN_NAME: last_viewed_at

-- 3. Check current ambassadors and their last_viewed_at status
SELECT 
    id,
    name,
    affiliate_code,
    is_active,
    last_viewed_at,
    CASE 
        WHEN last_viewed_at IS NULL THEN 'Never viewed'
        ELSE CONCAT('Last viewed: ', last_viewed_at)
    END as view_status
FROM ambassadors
ORDER BY id;

-- 4. Count affiliate usage per ambassador
SELECT 
    a.id,
    a.name,
    a.affiliate_code,
    COUNT(au.id) as total_leads,
    a.last_viewed_at
FROM ambassadors a
LEFT JOIN affiliate_usage au ON a.id = au.ambassador_id
WHERE a.is_active = 1
GROUP BY a.id, a.name, a.affiliate_code, a.last_viewed_at
ORDER BY total_leads DESC;

-- 5. Show unread count calculation (simulating the backend logic)
SELECT 
    a.id,
    a.name,
    a.affiliate_code,
    a.last_viewed_at,
    COUNT(CASE 
        WHEN a.last_viewed_at IS NULL THEN au.id
        WHEN au.first_used_at > a.last_viewed_at THEN au.id
        ELSE NULL
    END) as unread_count,
    COUNT(au.id) as total_leads
FROM ambassadors a
LEFT JOIN affiliate_usage au ON a.id = au.ambassador_id
WHERE a.is_active = 1
GROUP BY a.id, a.name, a.affiliate_code, a.last_viewed_at
ORDER BY unread_count DESC;

-- ============================================
-- TROUBLESHOOTING GUIDE
-- ============================================

-- IF Query 1 returns 0 rows:
-- ❌ The column doesn't exist - you need to run the migration:
--    mysql -u root -p zona_english_admin < backend/migrations/add_last_viewed_to_ambassadors.sql

-- IF Query 2 returns 0 rows:
-- ❌ The index doesn't exist - run:
--    CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);

-- IF Query 5 shows unread_count = 0 for all ambassadors:
-- This could mean:
--    1. No leads have been created yet (check total_leads column)
--    2. All ambassadors have been viewed after their leads were created
--    3. last_viewed_at timestamps are incorrect

-- To reset all last_viewed_at (for testing):
-- UPDATE ambassadors SET last_viewed_at = NULL;

-- To manually set last_viewed_at to past date (for testing):
-- UPDATE ambassadors SET last_viewed_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id = 1;
