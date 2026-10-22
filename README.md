# 🎓 NextHire — AI-Powered Campus Placement & Blind Hiring Platform

**NextHire** is a modern, unified campus recruitment platform connecting **Students**, **Companies**, and **College Placement Cells (TPO)**. It features an automated AI screening engine designed on **blind hiring principles** to eliminate demographic bias, benchmark candidate fit, automate multi-round interview tracking, and streamline campus drives.

---

## 🌟 Key Features

### 🏢 1. Company & HR Portal (`/company`)
* **AI Resume Screening Engine**: Bulk upload PDF resumes and analyze candidate competency against Job Descriptions (JDs) using Groq AI (`openai/gpt-oss-120b` / LLaMA) with built-in hallucination guardrails.
* **Blind Hiring Mode**: Screens candidates strictly on technical skills, projects, and verifiable experience while masking personal identifiers to ensure zero bias.
* **Interactive Candidate Leaderboard**: Dynamic ranking scores (0–100), key strengths, critical skill gaps, and AI justifications.
* **Interview Pipeline Manager**: Track multi-round evaluations (Coding, Technical, System Design, HR, Cultural Fit) with verdict management (Accept/Reject/Pending) and upcoming schedule dates.
* **1-Click AI Email Generator**: Automatically drafts personalized interview invitations and candidate feedback.
* **Hiring Funnel Analytics**: Real-time metrics on total jobs, screening throughput, shortlist ratios, and hiring velocity.

### 🎓 2. Student Portal (`/student`)
* Role-specific dashboard to discover active job listings, upload resumes, track application status, and view AI-recommended skill improvement areas.

### 🏛️ 3. College / TPO Portal (`/college`)
* Placement coordinator dashboard to track drive statistics, student eligibility, company partnerships, and departmental placement percentages.

---

## 🛠️ Tech Stack

* **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router, Webpack)
* **UI & Styling**: React 19, Vanilla CSS, Tailwind CSS v4, Lucide Icons, Material Symbols
* **PDF Processing**: `pdfjs-dist` (client-side text extraction & section parser)
* **AI Inference**: [Groq SDK](https://groq.com/) (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) / [Google Generative AI](https://ai.google.dev/)
* **Authentication**: [NextAuth.js v5](https://authjs.dev/) with role-based credentials
* **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) with [Prisma ORM](https://www.prisma.io/)
* **Testing & Quality Assurance**:
  * **Functional / UI Testing**: Selenium IDE (`.side`) & Selenium WebDriver (Python)
  * **Non-Functional / Load Testing**: Apache JMeter (`.jmx`)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **npm**: v9+
* **PostgreSQL Database** (e.g., Neon Postgres)
* **Groq API Key** (from [console.groq.com](https://console.groq.com))

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd placement-platform
npm install
