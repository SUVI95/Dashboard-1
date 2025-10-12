# 🚀 Setup Instructions for MVP Launch

## ⚡ Quick Start (5 minutes)

### 1. Connect to Neon Database

Your Neon database is already set up! Update the backend environment:

\`\`\`bash
cd backend
\`\`\`

Get your Neon connection string from: https://console.neon.tech

Update `backend/.env` (or create if missing):
\`\`\`env
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[database]?sslmode=require
\`\`\`

### 2. Run Database Migrations

\`\`\`bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
\`\`\`

### 3. Seed Demo Data

\`\`\`bash
npm run prisma:seed
\`\`\`

This creates:
- Admin account: `admin@duunijobs.fi` / `Admin123!`
- Test candidate: `candidate@test.com` / `Candidate123!`
- 5 sample jobs

### 4. Start Backend

\`\`\`bash
# Make sure Redis is running
redis-server

# Start backend
npm run start:dev
\`\`\`

Backend will be available at: http://localhost:3001
API Docs: http://localhost:3001/api/docs

### 5. Start Frontend

\`\`\`bash
# In project root
npm install
npm start
\`\`\`

Frontend will be available at: http://localhost:3000

## ✅ MVP Checklist

### Must-Have for Today's Launch

- [x] User Registration with OTP email verification
- [x] Login (Email/Password + Google/LinkedIn OAuth)
- [x] CV Upload (PDF/DOCX)
- [x] AI CV Parser (GPT-4 powered)
- [x] AI CV Fixer/Optimizer
- [x] Cover Letter Generator
- [x] ATS Resume Scanner
- [x] Job Board with skill matching
- [x] Application Tracking
- [x] Profile Management
- [x] GDPR Compliance (data export/deletion)
- [x] EU Cookie Consent Banner
- [x] Real-time notifications (WebSocket)
- [x] Encrypted file storage
- [x] Admin dashboard

### Configuration Needed

1. **OpenAI API Key** (CRITICAL!):
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Email Service** (for OTP):
   - For dev: OTP will be logged to console
   - For prod: Configure SMTP (SendGrid recommended)
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@duunijobs.fi
   ```

3. **File Storage**:
   - Local dev: MinIO (included in docker-compose)
   - Production: AWS S3
   ```
   # Local MinIO (auto-configured)
   S3_ENDPOINT=http://localhost:9000
   S3_ACCESS_KEY_ID=minioadmin
   S3_SECRET_ACCESS_KEY=minioadmin
   S3_BUCKET_NAME=duunijobs-cvs
   ```

4. **Redis** (for job queue):
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

5. **OAuth** (optional, but recommended):
   - Google: https://console.cloud.google.com/apis/credentials
   - LinkedIn: https://www.linkedin.com/developers/apps
   
   Add redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
   - `http://localhost:3001/api/auth/linkedin/callback`

## 🐳 Docker Quick Start (All-in-One)

Easiest way to launch everything:

\`\`\`bash
# Start all services
docker-compose up -d

# Wait 30 seconds for services to start, then:
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

# Check logs
docker-compose logs -f backend
\`\`\`

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

## 🧪 Test the Platform

### 1. Register a New User

1. Go to http://localhost:3000/register
2. Fill in details
3. Check console/email for OTP code
4. Verify email

### 2. Upload a CV

1. Go to Dashboard → CVs
2. Upload a PDF or DOCX resume
3. Wait for AI parsing (15-30 seconds)
4. View parsed data in Profile

### 3. Generate AI Cover Letter

1. Go to Jobs tab
2. Click on any job
3. Click "Generate Cover Letter"
4. Wait for AI generation
5. Download or copy the letter

### 4. ATS CV Scan

1. Go to CVs tab
2. Click "Scan Resume" on any CV
3. View ATS score and suggestions

## 🔧 Troubleshooting

### "Database connection failed"
\`\`\`bash
# Check Prisma can connect
cd backend
npx prisma db push
\`\`\`

### "OpenAI API error"
- Verify API key is correct
- Check OpenAI account has credits
- Ensure `gpt-4-turbo-preview` model access

### "File upload fails"
\`\`\`bash
# Create MinIO bucket
docker-compose exec minio mc mb local/duunijobs-cvs
\`\`\`

### "Redis connection error"
\`\`\`bash
# Check Redis is running
redis-cli ping
# Should return: PONG
\`\`\`

### "OTP not received"
- In development, check backend console logs for OTP code
- For production, configure SMTP settings

## 📝 Production Deployment Notes

### Pre-Launch Checklist

- [ ] Change all JWT secrets
- [ ] Configure production SMTP
- [ ] Set up AWS S3 (not MinIO)
- [ ] Configure Redis Cloud or AWS ElastiCache
- [ ] Enable HTTPS only
- [ ] Set up monitoring (Sentry)
- [ ] Configure domain and SSL
- [ ] Update CORS settings
- [ ] Test all OAuth flows
- [ ] Test payment integration (if enabled)
- [ ] Load test with expected traffic
- [ ] Backup strategy for database
- [ ] Set up log aggregation

### Environment Variables for Production

\`\`\`env
NODE_ENV=production
DATABASE_URL=<neon-connection-string>
REDIS_HOST=<redis-cloud-host>
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET_NAME=duunijobs-production-cvs
FRONTEND_URL=https://candidates.duunijobs.fi
OPENAI_API_KEY=<production-key>
SMTP_HOST=smtp.sendgrid.net
# ... all other production values
\`\`\`

## 🎯 MVP Feature Flow

### For Candidates

1. **Sign Up** → Email OTP verification
2. **Upload CV** → AI parses and populates profile
3. **Fix CV** → AI optimizes for ATS
4. **Browse Jobs** → See matched jobs based on skills
5. **Generate Cover Letter** → AI writes personalized letter
6. **Apply** → Track application status
7. **Interview Prep** → Get AI-generated Q&A

### For Admins

1. **Login** as admin@duunijobs.fi
2. **View Dashboard** → See all users, tasks, stats
3. **Monitor AI Tasks** → Check success/failure rates
4. **Retry Failed Tasks** → Manually retry if needed

## 🚨 Known Limitations (MVP)

- Auto-Apply feature: Backend ready, frontend UI pending
- Stripe payments: Integration pending
- LinkedIn profile import: Pending OAuth scopes
- Email notifications: Using console in dev mode
- File encryption: Using S3 SSE (not client-side)

## 📞 Support

If you encounter issues during setup:
1. Check backend logs: `docker-compose logs backend`
2. Check database connection: `npx prisma studio`
3. Verify all services are running: `docker-compose ps`

For urgent issues: contact development team

---

**Ready to Launch! 🎉**

Once everything is running, test the complete flow with a real CV upload and job application.

