#  Lemon Console

**Admin & User Dashboard for Lemon API**

A modern, secure Next.js web dashboard that provides a clean interface for interacting with the Lemon API.

## Features

- Authentication with httpOnly cookies
- User Dashboard
- Items Management (CRUD)
- Admin Tools
- Security First (BFF pattern)
- Modern UI with shadcn/ui

## Prerequisites

**Required: Lemon API must be running**

See https://github.com/Qixpy/Lemon-api

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_LEMON_API_BASE_URL=http://localhost:3000

# Run development server
npm run dev
```

Open http://localhost:3001

## Documentation

See full documentation above for:
- Installation
- Configuration  
- Security features
- API integration
- Troubleshooting

## Technology Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

**Built with **
