# Database Migrations

## Available Migrations

### 1. add_last_viewed_to_ambassadors.sql

Adds `last_viewed_at` column to `ambassadors` table for unread badge feature.

**Status**: Required for badge feature to work

**What it does**:

- Adds `last_viewed_at` TIMESTAMP column
- Creates index on `last_viewed_at` for performance

## How to Run Migrations

### Automatic (Recommended)

```bash
cd backend
npm run migrate
```

### Manual via MySQL CLI

```bash
mysql -u root -p zona_english_admin < backend/migrations/add_last_viewed_to_ambassadors.sql
```

### Manual via phpMyAdmin

1. Open phpMyAdmin
2. Select `zona_english_admin` database
3. Go to SQL tab
4. Copy-paste content from migration file
5. Execute

## Verify Migration

Run this SQL to check if column exists:

```sql
SHOW COLUMNS FROM ambassadors LIKE 'last_viewed_at';
```

Should return 1 row if migration successful.

## Troubleshooting

**Error: Unknown column 'last_viewed_at'**

- Migration not run yet
- Run: `npm run migrate`

**Error: Duplicate column**

- Migration already run
- Safe to ignore

**Error: Access denied**

- Check DB_PASSWORD in .env file
