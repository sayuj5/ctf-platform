🏴‍☠️ CTF Platform (Full Stack)

A full-stack Capture The Flag (CTF) platform built using Next.js and Supabase.

This platform allows organizers to host cybersecurity challenges where users can download vulnerable machines, submit flags, and compete on a leaderboard.

---

✨ Features

- 🔐 Authentication (Signup/Login)
- 🏴‍☠️ Challenge-based CTF system
- 📥 External VM download support
- 🧠 Flag validation system
- 🏆 Live leaderboard
- 🛠️ Admin panel for organizers
- ☁️ Supabase backend integration

---

🛠️ Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Supabase (Auth + Database)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

---

📦 Setup Instructions

1️⃣ Clone the repo
git clone https://github.com/YOUR_USERNAME/ctf-platform.git
cd ctf-platform

2️⃣ Install dependencies
npm install

3️⃣ Create .env.local

Add your Supabase keys:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

4️⃣ Setup Database

Run SQL files in Supabase SQL Editor:

DATABASE_SETUP.sql

SET_ADMIN.sql (optional)

VERIFY_ADMIN.sql (optional)

5️⃣ Run locally
npm run dev
git clone https://github.com/YOUR_USERNAME/ctf-platform.git
cd ctf-platform

👨‍💻 Author
Built by Sayuj Sur
Cybersecurity enthusiast & full-stack learner
