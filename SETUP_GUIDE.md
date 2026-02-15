# CTF Platform - Complete Setup Guide

## 🎯 Project Overview

A complete Capture The Flag (CTF) platform built with Next.js, Supabase, and Tailwind CSS. Users can register, access a vulnerable machine image, submit flags, and track their progress on a leaderboard. Admins have access to a control panel to monitor all submissions.

## ✨ Features

### User Features
- 🔐 User Registration & Login with Name, Email, Phone
- 📥 Download Vulnerable Machine Image
- 🚩 Submit 5 Different Flags with Validation
- 📊 Real-time Leaderboard with Rankings
- 💯 Points-based Scoring System
- 🎯 Track Personal Progress

### Admin Features
- 👥 View All User Submissions
- 📈 Real-time Statistics Dashboard
- 🏆 Detailed Leaderboard Management
- 📱 View User Contact Information

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Supabase account (free tier available at supabase.com)
- npm or yarn

### 1. Environment Setup

The `.env.local` file is already configured with Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://fuvbvttcbydxhuyjafzi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Database Setup

**IMPORTANT: Run the SQL in [DATABASE_SETUP.sql](DATABASE_SETUP.sql)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the entire contents of `DATABASE_SETUP.sql`
5. Run the query
6. Wait for all tables and policies to be created

This sets up:
- `users` table (extends Supabase auth)
- `flags` table (5 pre-configured flags)
- `submissions` table (user flag submissions)
- `downloads` table (track machine image downloads)
- Row-Level Security (RLS) policies for data protection

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── context/
│   └── AuthContext.tsx       # Authentication context & hooks
├── signup/
│   └── page.tsx              # User registration page
├── login/
│   └── page.tsx              # User login page
├── dashboard/
│   └── page.tsx              # Main dashboard with flags & downloads
├── leaderboard/
│   └── page.tsx              # Public leaderboard view
├── admin/
│   └── page.tsx              # Admin control panel
├── page.tsx                  # Home/redirect page
├── layout.tsx                # Root layout with AuthProvider
└── globals.css               # Global styles

lib/
└── supabase.ts               # Supabase client initialization

DATABASE_SETUP.sql            # SQL schema creation script
```

## 🔑 Key Components

### AuthContext.tsx
Manages user authentication state including:
- Login/Signup
- Session persistence
- User data fetching
- Logout functionality

### Pages
- **Signup**: New user registration with email, name, phone
- **Login**: User authentication
- **Dashboard**: Main interface - download vulnerable machine, submit flags, view progress
- **Leaderboard**: Public rankings with points and flag counts
- **Admin**: Statistics and detailed user submissions management

## 🚩 Flags Configuration

5 pre-configured flags (customize in DATABASE_SETUP.sql):
1. **Welcome Flag** (10 pts): `flag{welcome_to_ctf}`
2. **Web Vulnerability** (20 pts): `flag{sql_injection_found}`
3. **Privilege Escalation** (25 pts): `flag{privilege_escalated}`
4. **Password Cracking** (20 pts): `flag{password_cracked}`
5. **Final Flag** (30 pts): `flag{ctf_master}`

**Total possible points: 105**

## 👥 Admin Access

To create an admin user:

1. Register a new account normally
2. Go to Supabase SQL Editor
3. Run:
```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

Admin account will have access to `/admin` with full leaderboard and stats.

## 📋 User Flow

```
Landing Page → Signup → Login → Dashboard
                               ├── Download Machine
                               ├── Submit Flags
                               └── View Leaderboard
                               
Admin Dashboard → Stats → Leaderboard → User Details
```

## 🔐 Security Features

- Supabase Authentication (Email/Password)
- Row-Level Security (RLS) policies
- Type-safe TypeScript
- Protected routes with auth checks
- Secure flag validation

## 🎨 UI Theme

- Dark theme with hacker aesthetic
- Green accent colors (#22c55e)
- Responsive design (mobile, tablet, desktop)
- Tailwind CSS styling

## 📦 Production Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy. Vercel will automatically detect Next.js and configure it.

### Deploy to Other Platforms
- Railway: `railway up`
- Render: Connect GitHub repo
- AWS: Use Amplify or EC2
- Azure: Use App Service

## 🧪 Testing

### Test User Registration
1. Go to `/signup`
2. Enter: name, email, phone, password
3. Should redirect to login

### Test Flag Submission
1. Login with test account
2. Click on a flag card
3. Enter flag: `flag{welcome_to_ctf}`
4. Should show ✅ success and update leaderboard

### Test Admin Access
1. Update user with `is_admin = true` in Supabase
2. Login and click "Admin Panel"
3. View stats and leaderboard

## 🐛 Troubleshooting

### "Unable to acquire lock" Error
```bash
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Path ".next/dev/lock" -Force
npm run dev
```

### Database Connection Issues
- Verify `.env.local` has correct Supabase URL and key
- Check RLS policies are enabled in Supabase
- Ensure you ran the `DATABASE_SETUP.sql` script

### Login Issues
- Clear browser cache/cookies
- Check Supabase project status
- Verify auth table exists in Supabase

## 📞 Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Review Tailwind CSS: https://tailwindcss.com/docs

## 🎉 Ready to Launch!

Your CTF platform is now complete and running at http://localhost:3000

**Next Steps:**
1. ✅ Run DATABASE setup SQL
2. ✅ Test user registration
3. ✅ Create admin account
4. ✅ Test flag submissions
5. ✅ Deploy to production

Enjoy your CTF event! 🚩
