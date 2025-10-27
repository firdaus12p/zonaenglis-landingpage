# 🚀 SETUP DATABASE & MCP MYSQL SERVER - NEXT STEPS

## ✅ Status Saat Ini

- [x] MCP MySQL Server installed (c:\Projek\mcp-server-mysql)
- [x] Dependencies installed (411 packages)
- [x] .env configured untuk XAMPP MySQL port 3307
- [x] Database schema ready (zona_english_admin.sql)
- [ ] **XAMPP MySQL belum running**
- [ ] **Database belum diimport**
- [ ] **MCP Server belum dijalankan**

## 📋 Langkah-Langkah Setup

### 1️⃣ Start XAMPP MySQL

```bash
# Buka XAMPP Control Panel
# Pastikan MySQL running di port 3307
# Pastikan Apache juga running (untuk phpMyAdmin)
```

**Verifikasi:**

- MySQL indicator hijau di XAMPP Control Panel
- Bisa akses http://localhost/phpmyadmin

---

### 2️⃣ Import Database Schema

**Option A: Via phpMyAdmin (RECOMMENDED)**

1. Buka browser: `http://localhost/phpmyadmin`
2. Klik tab **"Import"**
3. Klik **"Choose File"**
4. Pilih: `c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql`
5. Scroll ke bawah, klik **"Go"**
6. Tunggu sampai muncul pesan sukses

**Option B: Via MySQL Command Line**

```bash
# Buka Command Prompt
mysql -u root -p -P 3307 < c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql

# Jika XAMPP default (no password):
mysql -u root -P 3307 < c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql
```

**Verifikasi:**

```sql
-- Di phpMyAdmin, jalankan query ini:
SHOW DATABASES LIKE 'zona_english_admin';
USE zona_english_admin;
SHOW TABLES;

-- Harus muncul 7 tables:
-- 1. admin_users
-- 2. ambassadors
-- 3. promo_codes
-- 4. countdown_batches
-- 5. articles
-- 6. affiliate_transactions
-- 7. promo_usage

-- Cek sample data:
SELECT COUNT(*) FROM ambassadors; -- Harus ada 3
SELECT COUNT(*) FROM promo_codes; -- Harus ada 3
```

---

### 3️⃣ Test MCP MySQL Server Connection

```bash
cd c:\Projek\mcp-server-mysql
npm start
```

**Expected Output:**

```
MCP Server MySQL started
Connected to MySQL database: zona_english_admin
Server running on stdio mode
```

**Jika Error:**

```bash
# Error: Cannot connect to MySQL
# Solution: Pastikan XAMPP MySQL running di port 3307

# Error: Access denied for user 'root'
# Solution: Check password XAMPP MySQL
# Edit c:\Projek\mcp-server-mysql\.env
# Set MYSQL_PASS=your_xampp_password
```

---

### 4️⃣ Test Query via MCP Server

Setelah MCP server running, Anda bisa test query:

**Test 1: Get All Ambassadors**

```json
{
  "action": "query",
  "sql": "SELECT * FROM ambassadors WHERE is_active = 1"
}
```

**Test 2: Validate Affiliate Code**

```json
{
  "action": "query",
  "sql": "SELECT * FROM ambassadors WHERE affiliate_code = 'ZE-SNR-SAR001'"
}
```

**Test 3: Get Active Promo Codes**

```json
{
  "action": "query",
  "sql": "SELECT * FROM promo_codes WHERE is_active = 1 AND NOW() BETWEEN valid_from AND valid_until"
}
```

---

## 🎯 Next: Migrate React App from localStorage to MySQL

### Current Architecture:

```
React Frontend (PromoHub.tsx)
    ↓
localStorage (browser-side)
```

### Target Architecture:

```
React Frontend (PromoHub.tsx)
    ↓
Express.js Backend API (c:\Projek\zonaenglis-landingpage\backend)
    ↓
MCP MySQL Server
    ↓
XAMPP MySQL Database (zona_english_admin)
```

### Files to Create:

**1. Backend API (Express.js)**

```bash
mkdir c:\Projek\zonaenglis-landingpage\backend
cd c:\Projek\zonaenglis-landingpage\backend
npm init -y
npm install express cors mysql2 dotenv
```

**File structure:**

```
backend/
├── server.js           # Main Express server
├── routes/
│   ├── ambassadors.js  # GET, POST, PUT, DELETE /api/ambassadors
│   ├── promos.js       # GET /api/promos
│   └── validate.js     # POST /api/validate-code
├── db/
│   └── connection.js   # MySQL connection via MCP
├── .env                # Database credentials
└── package.json
```

**2. Update React Components**

Replace `localStorage` calls with `fetch` API calls:

```typescript
// OLD (PromoHub.tsx line ~500):
const ambassadors = JSON.parse(localStorage.getItem("ambassadors") || "[]");

// NEW:
const [ambassadors, setAmbassadors] = useState([]);

useEffect(() => {
  fetch("http://localhost:3001/api/ambassadors")
    .then((res) => res.json())
    .then((data) => setAmbassadors(data))
    .catch((err) => console.error(err));
}, []);
```

---

## 🔒 Security Checklist

- [ ] Change MySQL root password (production)
- [ ] Add JWT authentication to backend API
- [ ] Validate all input data server-side
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables (.env) for secrets
- [ ] Never commit .env files to Git

---

## 📊 Database Features Available

### ✅ Sample Data Included:

**Ambassadors (3 sample):**

1. Sari Dewi (Senior Ambassador) - ZE-SNR-SAR001
2. Ahmad Rahman (Campus Ambassador) - ZE-CMP-AHM002
3. Maya Putri (Community Ambassador) - ZE-COM-MAY003

**Promo Codes (3 sample):**

1. GAJIAN90 - 90% off
2. EARLY50 - 50% off
3. STUDENT25 - 25% off

**Admin User (default):**

- Username: `admin`
- Email: `admin@zonaenglish.id`
- Password: `admin123`
- Role: `super_admin`

### ✅ Auto Features:

- **Triggers**: Auto-update ambassador stats saat ada transaksi
- **Views**: Analytics views untuk reporting
- **Foreign Keys**: Data integrity enforcement
- **Indexes**: Query optimization

---

## 🛠️ Troubleshooting

**Problem: phpMyAdmin tidak bisa diakses**

```bash
# Start Apache di XAMPP Control Panel
# Cek http://localhost:8080/phpmyadmin (jika port 80 sudah dipakai)
```

**Problem: MySQL tidak bisa start**

```bash
# Port 3306/3307 sudah dipakai aplikasi lain
# Solution: Ganti port di XAMPP > MySQL > Config > my.ini
# Cari: port=3307
# Atau stop aplikasi yang pakai port tersebut
```

**Problem: MCP Server cannot connect**

```bash
# Cek credentials di .env:
cd c:\Projek\mcp-server-mysql
Get-Content .env | Select-String "MYSQL_"

# Verifikasi:
# MYSQL_HOST=127.0.0.1
# MYSQL_PORT=3307
# MYSQL_USER=root
# MYSQL_PASS=    (kosong jika default XAMPP)
# MYSQL_DB=zona_english_admin
```

---

## 📞 Ready for Next Phase

Setelah setup database selesai, kita bisa lanjut ke:

1. **Create Express.js Backend API**
2. **Update React Components** (replace localStorage)
3. **Add Authentication System**
4. **Deploy to Production**

---

**Last Updated:** 2025-10-27  
**MCP MySQL Config:** c:\Projek\mcp-server-mysql\.env  
**Database Schema:** c:\Projek\zonaenglis-landingpage\database\zona_english_admin.sql
