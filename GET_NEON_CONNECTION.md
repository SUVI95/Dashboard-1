# 🔗 Get Your Neon Connection String

## Your Neon Project Details:
- **Project Name:** DuuniDash
- **Project ID:** soft-cell-88391411

---

## 📋 Steps to Get Your Connection String:

### Option 1: From Neon Dashboard

1. Go to: **https://console.neon.tech/app/projects/soft-cell-88391411**

2. Look for one of these sections:
   - "Connection Details"
   - "Connection String" 
   - "Database Connection"
   - "Quick Start"

3. You should see a string that looks like:
   ```
   postgresql://[username]:[password]@ep-[something].us-east-2.aws.neon.tech/[database]?sslmode=require
   ```

4. **Copy the ENTIRE string** (including `postgresql://` at the start)

5. It should include:
   - Username (usually starts with project name)
   - Password (randomly generated)
   - Endpoint (ep-something.region.aws.neon.tech)
   - Database name (often "neondb" or your project name)

### Option 2: Create a New Database

If you can't find the connection string, create a new database:

1. In your Neon project, click **"Create Database"**
2. Name it: `duunijobs` 
3. After creation, click on it
4. Find **"Connection string"** or **"Connection details"**
5. Copy the complete connection string

---

## ✅ What to Do With It:

Once you have the connection string:

1. **Open:** `/Users/gisrieliamaro/Dashboard-1-2/backend/.env`

2. **Find line 7** (starts with `DATABASE_URL=`)

3. **Replace** the entire line with:
   ```
   DATABASE_URL=your-copied-connection-string-here
   ```

4. **Save** the file

---

## 🚀 Then Run These Commands:

```bash
# Navigate to backend
cd /Users/gisrieliamaro/Dashboard-1-2/backend

# Deploy migrations
npx prisma migrate deploy

# Seed demo data
npm run prisma:seed

# Start backend
npm run start:dev
```

**In another terminal:**
```bash
# Start frontend
cd /Users/gisrieliamaro/Dashboard-1-2
npm start
```

---

## 🔍 Can't Find It?

If you're having trouble finding the connection string:

### Try this direct link:
https://console.neon.tech/app/projects/soft-cell-88391411

Look for:
- "Connection Details" tab
- "Connection String" section
- A button that says "Copy connection string"
- Or a text field with `postgresql://...`

### Still stuck?

The connection string format is:
```
postgresql://[username]:[password]@[endpoint-hostname]/[database]?sslmode=require
```

Example (yours will be different):
```
postgresql://duunidash_owner:AbCdEf123456@ep-cool-name-12345678.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## ⚠️ Common Issues:

**"Can't connect to database"**
→ Make sure you copied the COMPLETE string including password

**"Password authentication failed"**  
→ The connection string might be missing the password part

**"Database does not exist"**
→ Create a new database in Neon dashboard first

---

## 📞 Need Help?

Once you have the connection string, just paste it into `backend/.env` on line 7 and run the commands above.

Your platform will be live in 2 minutes! 🎉

