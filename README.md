# Daily Macros

A personal food logging app built with Next.js, Tailwind CSS, and Supabase Auth. Track your daily calorie and protein intake with a beautiful, modern interface.

## Features

- 🔐 **Authentication**: Secure email/password login with Supabase Auth
- 📊 **Dashboard**: Visual progress tracking with circular progress rings
- ➕ **Food Logging**: Multiple ways to log food (manual, search, photo)
- ⭐ **Favorites**: Quick access to frequently logged foods
- 🎯 **Goal Setting**: Customizable daily calorie and protein targets
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 💾 **Data Persistence**: User-specific data stored in Supabase

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd daily-macros
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Spoonacular API (for food images)
NEXT_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

4. Set up the database:
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL to create the necessary tables and policies

5. Configure Authentication:
   - In your Supabase dashboard, go to Authentication > Settings
   - Enable "Enable email confirmations" if you want email verification
   - Configure any additional auth settings as needed

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The app uses three main tables in Supabase:

### `food_log`
Stores daily food entries for each user:
- `id`: Unique identifier
- `user_id`: References the authenticated user
- `name`: Food name
- `calories`: Calorie content
- `protein`: Protein content (grams)
- `timestamp`: When the food was logged

### `favorites`
Stores user's favorite foods for quick access:
- `id`: Unique identifier
- `user_id`: References the authenticated user
- `name`: Food name
- `calories`: Calorie content
- `protein`: Protein content (grams)
- `timestamp`: When the favorite was added

### `goals`
Stores user's daily nutrition goals:
- `id`: Unique identifier
- `user_id`: References the authenticated user (unique)
- `daily_calories`: Daily calorie target
- `daily_protein`: Daily protein target (grams)

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Authentication Setup

The app uses Supabase Auth for user management. To enable email/password authentication:

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable "Enable email confirmations" if you want email verification
3. Configure any additional auth settings as needed

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Set Goals**: Configure your daily calorie and protein targets
3. **Log Food**: Use manual entry, search, or photo recognition
4. **Track Progress**: View your daily progress on the dashboard
5. **Manage Favorites**: Save frequently eaten foods for quick access

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
daily-macros/
├── app/                    # Next.js App Router pages
│   ├── components/         # Reusable components
│   ├── dashboard/          # Dashboard page
│   ├── favorites/          # Favorites management
│   ├── log/               # Food logging pages
│   ├── auth/              # Combined auth page
│   └── login/             # Legacy auth pages
├── lib/                   # Utility functions and contexts
│   ├── AuthContext.tsx    # Authentication context
│   ├── FoodLogContext.tsx # Food logging state with Supabase
│   └── supabase.ts        # Supabase client
├── supabase-schema.sql    # Database schema
└── public/                # Static assets
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
