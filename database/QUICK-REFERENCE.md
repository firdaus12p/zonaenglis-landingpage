# 🚀 Quick Reference - Database & MCP MySQL Commands

## 🎯 Start XAMPP MySQL

```bash
# Via XAMPP Control Panel GUI
# Click "Start" di MySQL module
# Port: 3307
```

---

## 📦 MCP MySQL Server Commands

### Start MCP Server

```bash
cd c:\Projek\mcp-server-mysql
npm start
```

### Stop MCP Server

```
Ctrl + C
```

### Rebuild TypeScript

```bash
cd c:\Projek\mcp-server-mysql
npm run build
```

### Check Configuration

```bash
Get-Content c:\Projek\mcp-server-mysql\.env | Select-String "MYSQL_"
```

---

## 🗄️ MySQL Database Commands

### Connect via Command Line

```bash
mysql -u root -p -P 3307
```

### Select Database

```sql
USE zona_english_admin;
```

### Show Tables

```sql
SHOW TABLES;
```

### Quick Queries

```sql
-- Get all active ambassadors
SELECT id, name, role, affiliate_code, is_active
FROM ambassadors
WHERE is_active = 1;

-- Validate affiliate code
SELECT * FROM ambassadors
WHERE affiliate_code = 'ZE-SNR-SAR001';

-- Get active promo codes
SELECT code, name, discount_type, discount_value, valid_until
FROM promo_codes
WHERE is_active = 1
AND NOW() BETWEEN valid_from AND valid_until;

-- Count ambassadors by role
SELECT role, COUNT(*) as total
FROM ambassadors
GROUP BY role;

-- Top ambassadors by earnings
SELECT name, role, total_earnings, referrals
FROM ambassadors
ORDER BY total_earnings DESC
LIMIT 10;
```

---

## 📊 Database Verification Queries

### After Import - Check Sample Data

```sql
USE zona_english_admin;

-- Should show 3 ambassadors
SELECT COUNT(*) as total FROM ambassadors;

-- Should show 3 promo codes
SELECT COUNT(*) as total FROM promo_codes;

-- Should show 1 admin user
SELECT COUNT(*) as total FROM admin_users;

-- List all ambassadors with codes
SELECT name, role, affiliate_code, is_active
FROM ambassadors
ORDER BY id;
```

---

## 🔧 Configuration Files

### MCP MySQL .env

```
Location: c:\Projek\mcp-server-mysql\.env

Key settings:
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASS=
MYSQL_DB=zona_english_admin

ALLOW_INSERT_OPERATION=true
ALLOW_UPDATE_OPERATION=true
ALLOW_DELETE_OPERATION=true
ALLOW_DDL_OPERATION=true
```

### Database Schema

```
Location: c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql

Tables:
1. admin_users        - Admin authentication
2. ambassadors        - Ambassador profiles with affiliate codes
3. promo_codes        - Promo code management
4. countdown_batches  - Event countdown timers
5. articles           - Content management
6. affiliate_transactions - Commission tracking
7. promo_usage        - Promo code usage logs
```

---

## 🛠️ Troubleshooting Quick Fixes

### MySQL Won't Start

```bash
# Check if port 3307 is in use
netstat -ano | findstr :3307

# Kill process if needed (replace PID)
taskkill /PID <PID> /F
```

### MCP Server Connection Error

```bash
# Test MySQL connection directly
mysql -u root -P 3307 -e "SHOW DATABASES;"

# Check if zona_english_admin exists
mysql -u root -P 3307 -e "SHOW DATABASES LIKE 'zona%';"
```

### phpMyAdmin Access Denied

```bash
# Default XAMPP credentials:
Username: root
Password: (leave empty)

# If changed, check XAMPP config:
c:\xampp\phpMyAdmin\config.inc.php
```

---

## 📝 Sample Data Reference

### Default Admin

```
Username: admin
Password: admin123
Email: admin@zonaenglish.id
```

### Ambassador Codes

```
ZE-SNR-SAR001 - Sari Dewi (Senior Ambassador)
ZE-CMP-AHM002 - Ahmad Rahman (Campus Ambassador)
ZE-COM-MAY003 - Maya Putri (Community Ambassador)
```

### Promo Codes

```
GAJIAN90  - 90% discount, valid: 2025-10-25 to 2025-11-05
EARLY50   - 50% discount, valid: 2025-10-01 to 2025-11-30
STUDENT25 - 25% discount, valid: 2025-10-01 to 2025-12-31
```

---

## 🚀 Development Workflow

1. **Start Services**

   ```bash
   # 1. Start XAMPP MySQL (port 3307)
   # 2. Start MCP Server
   cd c:\Projek\mcp-server-mysql
   npm start
   ```

2. **Test Connection**

   ```sql
   USE zona_english_admin;
   SELECT COUNT(*) FROM ambassadors;
   ```

3. **Make Changes**

   ```sql
   -- Add new ambassador
   INSERT INTO ambassadors (name, role, location, affiliate_code)
   VALUES ('Test User', 'Campus Ambassador', 'Jakarta', 'ZE-TEST999');
   ```

4. **Verify via MCP**
   ```json
   {
     "action": "query",
     "sql": "SELECT * FROM ambassadors WHERE affiliate_code = 'ZE-TEST999'"
   }
   ```

---

## 📞 Next Steps

After database is running:

1. ✅ Import zona_english_admin.sql
2. ✅ Start MCP MySQL Server
3. ⏳ Create Express.js Backend API
4. ⏳ Update React Components
5. ⏳ Test End-to-End Flow

---

**Quick Access:**

- phpMyAdmin: http://localhost/phpmyadmin
- MCP Config: `c:\Projek\mcp-server-mysql\.env`
- Database Schema: `c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql`
