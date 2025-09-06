# Couples App Admin Dashboard

## Project Overview

A comprehensive admin dashboard for managing a couples mobile app, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🔐 Authentication
- Secure admin login with Supabase Auth
- Protected routes and session management

### 📊 Dashboard Analytics
- User count and engagement metrics
- Quiz completion statistics
- Visual charts and analytics
- Real-time data overview

### 👥 User Management
- View all registered users
- Edit user profiles (name, gender, country)
- Delete users
- Search and filter functionality
- User status tracking (complete/incomplete profiles)

### 🧠 Quiz Management
- **Quiz Themes**: Create and manage quiz categories
- **Quizzes**: Create quizzes linked to themes
- **Quiz Questions**: Add questions to quizzes with ordering
- Full CRUD operations for all quiz components

### ❓ Questions Management
- Create pre-defined questions for daily use
- Set default scheduling times
- Manage question library

### 📅 Daily Questions Management
- Schedule questions for specific dates
- Assign questions to specific couples or all couples
- Track scheduled vs. completed questions

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **State Management**: React Query (TanStack Query)

## Database Schema

The dashboard manages the following database entities:
- Users (profiles)
- Couples
- Questions & Daily Questions
- Quiz Themes, Quizzes, Quiz Questions, Quiz Answers
- And more as defined in the provided schema

## Design System

- Clean, minimal interface with purple accent colors
- Responsive design for all screen sizes
- Consistent component styling using design tokens
- Dark/light mode support built-in

## Getting Started

### Prerequisites
- Node.js & npm
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

The dashboard is pre-configured with Supabase credentials. The admin authentication uses Supabase Auth - create an admin user in your Supabase project to access the dashboard.

## Usage

1. **Login**: Use your Supabase admin credentials
2. **Dashboard**: View overview metrics and analytics
3. **Users**: Manage user profiles and data
4. **Quiz Management**: Create themes, quizzes, and questions
5. **Daily Questions**: Schedule questions for couples

## Features Highlights

- ✅ Complete CRUD operations for all entities
- ✅ Real-time data updates
- ✅ Search and filtering
- ✅ Responsive design
- ✅ Clean, professional UI
- ✅ Comprehensive analytics
- ✅ Secure authentication

## Deployment

Deploy using the Lovable platform by clicking the Publish button, or deploy to any hosting service that supports static sites.
