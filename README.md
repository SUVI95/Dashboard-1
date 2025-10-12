# DuuniJobs Candidates Dashboard

🚀 **AI-Powered Job Search Platform** - Upload your CV, get AI-powered improvements, generate cover letters, and find matching jobs automatically.

## 🌟 Features

### For Candidates
- **AI Resume Builder**: Upload CV (PDF/DOCX) → Auto-parse → AI-optimize for ATS
- **Cover Letter Generator**: GPT-4 powered personalized cover letters for each job
- **Resume Scanner**: Real-time ATS feedback with improvement suggestions
- **Job Matching**: Smart job recommendations based on your skills
- **Auto-Apply**: Automated job applications (coming soon)
- **Interview Prep**: AI-generated interview questions and answers
- **Resume Translator**: Translate your CV to any language
- **Application Tracking**: Track all your applications in one place

### Security & Compliance
- ✅ **GDPR Compliant**: Full data export and deletion endpoints
- 🔒 **End-to-end Encryption**: All files encrypted at rest (AES-256)
- 🇪🇺 **EU Data Protection**: Hosted with EU GDPR compliance
- 🍪 **Cookie Consent**: EU cookie law compliant

### Tech Stack
- **Frontend**: React, Material-UI, Bootstrap (Sofia template)
- **Backend**: NestJS, TypeScript, Prisma
- **Database**: PostgreSQL (Neon serverless)
- **Queue**: BullMQ + Redis
- **Storage**: S3-compatible (MinIO local, AWS S3 prod)
- **AI**: OpenAI GPT-4 Turbo
- **Real-time**: Socket.IO for notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Neon cloud)
- Redis
- OpenAI API key

### 1. Clone & Install

\`\`\`bash
git clone <your-repo>
cd Dashboard-1-2

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
\`\`\`

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
\`\`\`env
# Database (Neon or local)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# S3 Storage (MinIO for dev, AWS for prod)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=duunijobs-cvs

# OpenAI (CRITICAL - Add your key!)
OPENAI_API_KEY=sk-your-openai-key-here

# JWT Secrets (Change in production!)
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
\`\`\`

**Frontend** (`.env`):
\`\`\`env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
\`\`\`

### 3. Start with Docker (Recommended)

\`\`\`bash
# Start all services (Postgres, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed demo data
docker-compose exec backend npm run prisma:seed

# View logs
docker-compose logs -f backend
\`\`\`

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001

### 4. Start Manually (Without Docker)

**Terminal 1 - Database & Redis**:
\`\`\`bash
# Start PostgreSQL (or use Neon cloud)
# Start Redis
redis-server

# Or use Docker for services only:
docker-compose up postgres redis minio
\`\`\`

**Terminal 2 - Backend**:
\`\`\`bash
cd backend

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed demo data
npm run prisma:seed

# Start backend
npm run start:dev
\`\`\`

**Terminal 3 - Workers** (for CV parsing, AI tasks):
\`\`\`bash
cd backend
npm run worker
\`\`\`

**Terminal 4 - Frontend**:
\`\`\`bash
npm start
\`\`\`

## 👤 Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@duunijobs.fi | Admin123! |
| **Candidate** | candidate@test.com | Candidate123! |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-otp` - Verify email with OTP
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth

### CV Management
- `POST /api/cv/upload` - Upload CV (PDF/DOCX)
- `GET /api/cv` - List user's CVs
- `GET /api/cv/:id` - Get CV details
- `POST /api/cv/:id/fix` - Request AI CV optimization
- `POST /api/cv/:id/scan` - ATS scan with feedback
- `POST /api/cv/:id/translate` - Translate CV
- `DELETE /api/cv/:id` - Delete CV (GDPR)

### AI Services
- `POST /api/ai/cover-letter` - Generate cover letter
- `POST /api/ai/interview-prep` - Generate interview Q&A
- `GET /api/ai/tasks/:id` - Get task status
- `GET /api/ai/tasks` - List all tasks

### Jobs & Applications
- `GET /api/jobs` - List jobs (with filtering)
- `GET /api/jobs/matched` - Get jobs matched to user profile
- `POST /api/applications` - Create application draft
- `POST /api/applications/:id/submit` - Submit application
- `GET /api/applications` - List user applications

### User Profile
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/avatar` - Upload avatar
- `GET /api/users/me/export` - Export all data (GDPR)
- `DELETE /api/users/me` - Request account deletion (GDPR)

### Admin (Admin role only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/tasks` - List all AI tasks
- `GET /api/admin/stats` - Platform statistics
- `POST /api/admin/tasks/:id/retry` - Retry failed task

Full API docs: http://localhost:3001/api/docs

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with roles (CANDIDATE, EMPLOYER, ADMIN)
- `profiles` - User profiles with skills, experience, education
- `cvs` - Uploaded CVs with encryption metadata
- `parsed_resumes` - AI-parsed CV data
- `ai_tasks` - Async AI jobs (parsing, fixing, cover letters)
- `jobs` - Job listings
- `applications` - Job applications with status tracking
- `audit_logs` - Audit trail for compliance

## 🔒 Security Features

1. **Authentication**: JWT with refresh tokens, OAuth2 (Google, LinkedIn)
2. **Email Verification**: OTP-based verification
3. **Encryption**: AES-256 for file storage
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **GDPR Compliance**: Data export, deletion endpoints
6. **Audit Logging**: All actions logged
7. **HTTPS Only**: Force HTTPS in production
8. **CORS Protection**: Configured CORS policies

## 🧪 Testing

\`\`\`bash
# Backend unit tests
cd backend
npm test

# Frontend tests
npm test

# E2E tests (coming soon)
npm run test:e2e
\`\`\`

## 📦 Production Deployment

### Environment Setup

1. **Database**: Use Neon PostgreSQL or AWS RDS
2. **Redis**: Use Redis Cloud or AWS ElastiCache
3. **Storage**: AWS S3 with KMS encryption
4. **Hosting**: AWS ECS, Google Cloud Run, or Kubernetes

### Build for Production

\`\`\`bash
# Backend
cd backend
npm run build

# Frontend
npm run build
\`\`\`

### Docker Production

\`\`\`bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

## 🔧 Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check Prisma connection
cd backend
npx prisma db push
\`\`\`

### OpenAI API Errors
- Verify your API key is valid
- Check your OpenAI account has credits
- Model `gpt-4-turbo-preview` is available

### File Upload Issues
- Ensure MinIO/S3 bucket exists
- Check S3 credentials are correct
- Verify file size limits (max 10MB)

### Redis Connection
\`\`\`bash
# Test Redis
redis-cli ping
\`\`\`

## 📞 Support

- **Issues**: [GitHub Issues](your-repo/issues)
- **Email**: support@duunijobs.fi
- **Website**: [duunijobs.fi](https://duunijobs.fi)

## 📄 License

Proprietary - © 2024 DuuniJobs. All rights reserved.

## 🎯 Roadmap

- [ ] Auto-Apply automation
- [ ] Stripe subscription integration
- [ ] Employer portal
- [ ] Mobile app (React Native)
- [ ] LinkedIn profile import
- [ ] Video interview prep
- [ ] Salary negotiation assistant

---

**Made with ❤️ by the DuuniJobs team**
