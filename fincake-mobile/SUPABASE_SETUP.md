# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password

## 2. Get Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Configure Environment Variables

Create a `.env` file in the project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Click **Run** to create the tables and policies

## 5. Seed Sample Data

1. In the **SQL Editor**, copy and paste the contents of `supabase/seed.sql`
2. Click **Run** to insert sample news clusters and articles

## 6. Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables: `news_clusters` and `news`
3. Check that the sample data was inserted correctly

## 7. Test the App

1. Start the Expo development server: `npx expo start`
2. Scan the QR code with Expo Go
3. Go to the "Thị trường" tab
4. You should see the news clusters loading and displaying

## Troubleshooting

- **"Failed to fetch clusters"**: Check your environment variables are correct
- **"No data"**: Verify the seed data was inserted successfully
- **Network errors**: Ensure your device and computer are on the same WiFi network
