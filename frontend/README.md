This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ClipForge AI - AI-Powered Video Repurposing Platform

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- AWS Account (for S3 storage)
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/clipforge-ai.git
cd clipforge-ai

AI Video Repurposing SaaS Platform
Absolutely! Let me help you with a comprehensive guide for pushing your ClipForge AI project to GitHub.

📋 Project Description
ClipForge AI - AI-Powered Video Repurposing Platform
ClipForge AI is a full-stack SaaS platform that automatically transforms long-form videos into viral short-form content for TikTok, Instagram Reels, and YouTube Shorts. Built for content creators who want to maximize their reach without spending hours on manual editing.

Key Features:
🎬 AI Video Processing - Automatic scene detection and clip segmentation

✂️ Smart Clip Generation - Creates platform-optimized short clips (9:16 aspect ratio)

📝 AI Captions & Hashtags - Generates viral captions and trending hashtags

🎙️ Whisper Transcription - High-accuracy speech-to-text

🎨 Auto Subtitles - Professional subtitle styling with animations

📊 Analytics Dashboard - Track views, downloads, and engagement

🔐 User Authentication - Secure JWT-based authentication with NextAuth

☁️ Cloud Storage - AWS S3/Cloudinary integration (with local fallback)

Tech Stack:
Backend:

FastAPI (Python) - High-performance API framework

PostgreSQL - Relational database

SQLAlchemy - ORM for database operations

Celery + Redis - Background task processing

FFmpeg - Video processing

Whisper AI - Speech-to-text

OpenAI GPT - Caption generation

Frontend:

Next.js 15 - React framework with Turbopack

TypeScript - Type-safe code

Tailwind CSS - Styling with dark mode

NextAuth.js - Authentication

Axios - HTTP client

Recharts - Analytics visualizations

DevOps:

Docker - Containerization

Nginx - Reverse proxy

GitHub Actions - CI/CD (optional)

🚀 How to Push to GitHub
Step 1: Create a .gitignore File
Create frontend/.gitignore and backend/.gitignore to exclude sensitive files.

Frontend .gitignore (in frontend/ folder):