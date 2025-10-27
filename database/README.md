# 📊 Database Setup Guide - Zona English Admin Dashboard

## 🎯 Overview

Database schema untuk admin dashboard Zona English yang mencakup manajemen:

- **Ambassadors** dengan sistem affiliate code
- **Promo Codes** dengan berbagai jenis diskon
- **Countdown Batches** untuk event timing
- **Articles** dengan content management
- **Admin Users** untuk akses kontrol

## 🛠️ Requirements

- **MySQL 8.0+**
- **XAMPP** dengan MySQL port **3307**
- **Apache** port **80, 443**

## 📥 Installation Steps

### 1. Start XAMPP Services

```bash
# Start Apache (port 80, 443)
# Start MySQL (port 3307)
```

### 2. Access phpMyAdmin

```
http://localhost/phpmyadmin
# or if using custom port:
http://localhost:8080/phpmyadmin
```

### 3. Import Database

1. Open phpMyAdmin
2. Create new database or click "Import"
3. Choose file: `database/zona_english_admin.sql`
4. Click "Go" to execute

### 4. Verify Installation

Check if these tables are created:

- ✅ `admin_users`
- ✅ `ambassadors`
- ✅ `promo_codes`
- ✅ `countdown_batches`
- ✅ `articles`
- ✅ `affiliate_transactions`
- ✅ `promo_usage`

## 🔑 Default Admin Access

```
Username: admin
Email: admin@zonaenglish.id
Password: admin123
Role: super_admin
```

## 📊 Database Features

### 🏆 Ambassador Management

- **Affiliate codes** untuk tracking referrals
- **Commission rates** yang bisa dikustomisasi
- **Badge system** sesuai dengan PromoHub
- **Performance tracking** otomatis

### 🎫 Promo Code System

- **Percentage & fixed amount** discounts
- **Usage limits** dan tracking
- **Date validity** controls
- **Analytics views** built-in

### ⏱️ Countdown Batch System

- **Timezone support** (WITA/Asia/Makassar)
- **Multiple batch** management
- **Homepage display** controls
- **Custom styling** options

### 📝 Article Management

- **Rich content** support (LONGTEXT)
- **SEO fields** (meta title, description)
- **Category & tag** system
- **Draft/Published** workflow
- **View counting** automatic

## 🔄 Auto-Update Features

### Triggers & Procedures:

- **Ambassador stats** update otomatis saat ada transaksi
- **Promo usage** counter otomatis
- **Performance views** untuk reporting

### Analytics Views:

- `ambassador_performance` - Real-time stats ambassador
- `promo_analytics` - Promo code effectiveness

## 🗂️ Table Relationships

```
admin_users (1) -----> (N) articles
admin_users (1) -----> (N) promo_codes
admin_users (1) -----> (N) countdown_batches

ambassadors (1) -----> (N) affiliate_transactions
promo_codes (1) -----> (N) promo_usage
```

## 🔒 Security Features

- **Password hashing** with bcrypt
- **Role-based access** (super_admin, admin, editor)
- **Foreign key constraints** untuk data integrity
- **Input validation** ready fields

## 📈 Sample Data Included

- ✅ **3 Sample ambassadors** (matching PromoHub data)
- ✅ **3 Promo codes** (GAJIAN90, EARLY50, STUDENT25)
- ✅ **1 Countdown batch** (Batch A - 03 Nov 2025)
- ✅ **2 Sample articles** untuk testing

## 🚀 Ready for Integration

Database schema sudah siap untuk:

- **React Dashboard Components**
- **API endpoints** development
- **Real-time updates** dengan PromoHub
- **Article system** integration

---

## 📞 Support

Jika ada issue saat import atau setup, database ini sudah dioptimasi untuk:

- **MySQL 8.0+** compatibility
- **Port 3307** configuration
- **XAMPP** environment
- **Production-ready** performance
