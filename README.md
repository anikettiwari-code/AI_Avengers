# 🎓 AI Avengers - Smart Attendance Management System

<div align="center">

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern, AI-powered attendance management system with facial recognition and QR code verification**

[🚀 Live Demo](#) • [📖 Documentation](#features) • [🐛 Report Bug](https://github.com/anikettiwari-code/AI_Avengers/issues)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## 🎯 About

**AI Avengers** is a comprehensive attendance management system built for **HackCrypt Hackathon**. It leverages cutting-edge technologies including facial recognition and dynamic QR codes to provide a secure, fraud-proof attendance tracking solution for educational institutions.

### 🔑 Key Highlights

- **Multi-factor Verification**: Combines facial recognition + QR code scanning
- **Real-time Tracking**: Instant attendance updates and notifications
- **Role-based Access**: Separate dashboards for Admin, Teachers, and Students
- **AI-Powered Scheduling**: NeuroScheduler for intelligent timetable management
- **Anti-Fraud Measures**: Biometric verification prevents proxy attendance

---

## ✨ Features

### 👨‍💼 Admin Dashboard
- 📊 System-wide analytics and reports
- 👥 User management (CRUD operations)
- 🗓️ NeuroScheduler - AI-powered timetable generation
- ⚙️ System settings and configuration

### 👩‍🏫 Teacher Dashboard
- 📝 Session management and attendance tracking
- 📷 Classroom facial scan for bulk attendance
- 📚 Course management
- 📊 Student grading and performance analytics

### 👨‍🎓 Student Dashboard
- 📱 QR code scanning for attendance
- 👤 Face registration and verification
- 📚 Enrolled courses view
- 📈 Results and attendance history

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS, Framer Motion |
| **State Management** | React Context API |
| **Backend/Database** | Supabase (PostgreSQL) |
| **AI/ML** | face-api.js (Face Recognition), GROQ AI |
| **QR Code** | react-qr-code |
| **Routing** | React Router v7 |
| **Icons** | Lucide React |
| **Deployment** | Netlify |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anikettiwari-code/AI_Avengers.git
   cd AI_Avengers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Set up the database**
   
   Run the SQL script in your Supabase SQL Editor:
   ```bash
   # Copy contents from supabase_schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 📁 Project Structure

```
AI_Avengers/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (MainLayout, Sidebar)
│   │   └── ui/              # UI primitives (Button, Card, Input)
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── SessionContext.tsx
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── teacher/         # Teacher dashboard pages
│   │   └── student/         # Student dashboard pages
│   ├── services/            # API and external services
│   ├── lib/                 # Utility libraries (Supabase client)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── data/                # Static data and constants
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── supabase_schema.sql      # Database schema
├── .env                     # Environment variables (not in repo)
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 👥 User Roles

| Role | Access Level | Key Features |
|------|--------------|--------------|
| **Admin** | Full System Access | User management, NeuroScheduler, Settings |
| **Teacher** | Course & Student Management | Session control, Classroom scan, Grading |
| **Student** | Personal Dashboard | QR scan, Face registration, Results |

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_GROQ_API_KEY` | GROQ AI API key | ✅ |

> ⚠️ **Never commit your `.env` file to version control!**

---

## 🗄️ Database Schema

The application uses three main tables:

- **profiles** - User data with role-based access (admin, teacher, student)
- **face_encodings** - Stores biometric face descriptors (128-float vectors)
- **attendance_logs** - Attendance records with verification method

See [`supabase_schema.sql`](./supabase_schema.sql) for the complete schema.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Team - AI Avengers

Built with ❤️ for **HackCrypt Hackathon**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with 💻 by Team AI Avengers

</div>