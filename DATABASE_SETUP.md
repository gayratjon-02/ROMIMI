# Database Setup Guide

## Muammo
Agar Supabase database ga ulanib bo'lmasa, quyidagi yechimlardan birini ishlating:

## Yechim 1: Local PostgreSQL (Tavsiya etiladi - Development uchun)

### 1. PostgreSQL o'rnatish (macOS)
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Database yaratish
```bash
createdb romimi
# yoki
psql postgres
CREATE DATABASE romimi;
\q
```

### 3. .env faylga qo'shing:
```env
# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=romimi
NODE_ENV=development
```

**Eslatma:** `DATABASE_URL` ni comment qiling yoki o'chiring:
```env
# DATABASE_URL=postgresql://...
```

## Yechim 2: To'g'ri Supabase URL

### 1. Supabase Dashboard ga kiring
- Project Settings > Database
- Connection String > Session Pooler (IPv4 compatible)

### 2. .env faylga qo'shing:
```env
# Session Pooler (IPv4 compatible) - TAVSIYA ETILADI
DATABASE_URL_POOLER=postgresql://postgres:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Yoki Direct Connection (faqat IPv6 bo'lsa)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 3. Parolni almashtiring
`[YOUR-PASSWORD]` o'rniga Supabase database parolini qo'ying.

## Yechim 3: Database bo'lmasa ham app ishga tushishi

Agar database connection bo'lmasa ham app ishga tushishi kerak bo'lsa, `synchronize: false` qiling va database connection ni optional qiling.

## Test qilish

```bash
# Local PostgreSQL tekshirish
psql -h localhost -U postgres -d romimi

# Yoki
npm run start:dev
```

Agar hali ham muammo bo'lsa, terminal loglarini tekshiring.
