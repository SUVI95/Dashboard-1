# 🧪 Test Your Platform - Complete Guide

## ✅ Services Status

Your DuuniJobs platform is now running!

### Running Services:
- **Backend**: http://localhost:3001 ✅
- **Frontend**: http://localhost:3000 ✅  
- **Database**: Neon PostgreSQL (connected) ✅
- **Redis**: localhost:6379 ✅
- **OpenAI**: GPT-4 Turbo (configured) ✅

---

## 🧪 Complete Test Flow

### Test 1: User Registration (2 minutes)

1. **Open**: http://localhost:3000
2. **Click**: "Sign Up" or "Register"
3. **Fill in**:
   - Name: Your Name
   - Email: yourtest@email.com
   - Password: TestPass123!
4. **Submit** the form
5. **Check backend console** for OTP code:
   ```bash
   tail -f /Users/gisrieliamaro/Dashboard-1-2/backend/backend.log | grep OTP
   ```
6. **Enter OTP** code from console
7. **Result**: You should be redirected to dashboard

### Test 2: Demo Account Login (30 seconds)

1. **Open**: http://localhost:3000/login
2. **Login with**:
   - Email: `candidate@test.com`
   - Password: `Candidate123!`
3. **Result**: Dashboard with welcome message

### Test 3: CV Upload & AI Parsing (2 minutes)

1. **Go to**: Dashboard → CVs (or /cvs)
2. **Click**: "Upload New CV"
3. **Upload**: Any PDF or DOCX resume
4. **Wait**: ~20-30 seconds for AI parsing
5. **Check**: 
   - CV status changes to "Parsed"
   - Your profile is auto-filled with extracted data
6. **Go to**: Profile page to see extracted skills

### Test 4: Premium CV Generator (2 minutes)

1. **Go to**: CVs page
2. **Click**: "Premium" button on a parsed CV
3. **You'll see**: Professional CV preview
4. **Click**: Download buttons
   - 🇬🇧 English
   - 🇧🇷 Português
   - 🇫🇮 Suomi
5. **Result**: Beautiful PDF downloaded in selected language

### Test 5: Cover Letter Generator (1 minute)

1. **Go to**: AI Assistant (sidebar)
2. **Select**: "Cover Letter Generator" tab
3. **Paste** a job description (any job posting text)
4. **Select tone**: Professional
5. **Click**: "Generate Cover Letter"
6. **Wait**: ~10 seconds
7. **Result**: Personalized cover letter generated

### Test 6: Job Board & Matching (1 minute)

1. **Go to**: Jobs (sidebar)
2. **See**: List of jobs with match scores
3. **Jobs should show**:
   - Match percentage based on your skills
   - Color-coded badges
   - Company and location
4. **Click**: "Apply Now" on any job

### Test 7: ATS Resume Scanner (1 minute)

1. **Go to**: CVs page
2. **Click**: "Scan" button on a parsed CV
3. **Wait**: ~15 seconds
4. **Go to**: AI Tasks to see results
5. **Result**: ATS score and suggestions

### Test 8: Admin Dashboard (30 seconds)

1. **Logout** from candidate account
2. **Login** as admin:
   - Email: `admin@duunijobs.fi`
   - Password: `Admin123!`
3. **Go to**: Admin Dashboard
4. **See**:
   - Total users
   - Total CVs
   - AI task statistics
   - User list
   - Task list

---

## 📊 Expected Results

### ✅ What Should Work:

| Feature | Expected Result |
|---------|----------------|
| Registration | OTP sent (console), email verified |
| Login | Access token received, redirect to dashboard |
| CV Upload | File uploaded, parsing starts |
| CV Parsing | Skills/experience extracted (~20-30s) |
| Premium CV | PDF downloaded in 3 languages |
| Cover Letter | Personalized letter generated |
| Job Matching | Jobs shown with match scores |
| Admin Panel | Stats and user list visible |

---

## 🐛 Troubleshooting

### Backend Not Responding?

```bash
# Check if running
ps aux | grep nest

# View logs
tail -f backend/backend.log

# Restart
killall node
cd backend && npm run start:dev
```

### Frontend Not Loading?

```bash
# Check logs
tail -f frontend.log

# Check for errors
grep -i error frontend.log

# Restart
killall node
npm start
```

### Database Connection Error?

```bash
# Test connection
cd backend
npx prisma studio  # Opens database viewer
```

### OpenAI API Error?

Your key is already configured:
```
sk-proj-oq5Av...GxMA
```

Check:
- OpenAI account has credits
- API key is valid
- Model `gpt-4-turbo-preview` is accessible

### OTP Not Showing?

In **development mode**, OTP is printed to backend console:

```bash
tail -f backend/backend.log | grep "OTP"
```

You'll see something like:
```
[DEV] OTP for yourtest@email.com: 123456
```

---

## 🎯 Critical User Flows to Test

### Flow 1: Complete Onboarding
1. Register → Verify email → Upload CV → AI parses → Profile complete

### Flow 2: Job Application
1. Browse jobs → Select job → Generate cover letter → Apply

### Flow 3: Premium Features
1. Upload CV → Fix with AI → Download premium PDF in 3 languages

---

## 📞 Quick Commands

### View All Processes:
```bash
ps aux | grep -E "nest|react" | grep -v grep
```

### View Backend Logs:
```bash
tail -f /Users/gisrieliamaro/Dashboard-1-2/backend/backend.log
```

### View Frontend Logs:
```bash
tail -f /Users/gisrieliamaro/Dashboard-1-2/frontend.log
```

### Stop All:
```bash
killall node
```

### Restart:
```bash
cd /Users/gisrieliamaro/Dashboard-1-2/backend && npm run start:dev &
cd /Users/gisrieliamaro/Dashboard-1-2 && npm start &
```

---

## ✨ Success Indicators

✅ Frontend loads at http://localhost:3000
✅ Can register and receive OTP
✅ Can login with demo credentials
✅ Can upload CV
✅ AI parses CV and fills profile
✅ Can generate premium CV PDF
✅ Can browse jobs with match scores
✅ Admin can view dashboard

---

## 🎉 You're Ready!

**Open now**: http://localhost:3000

Test with the demo account or create your own!

**Happy testing! 🚀**

