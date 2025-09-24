# Environment Variables Setup

## Option 1: Create .env file (Recommended)

Create a `.env` file in the `fincake-mobile` directory with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://fwcktzrwaazlzxstbnbp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Y2t0enJ3YWF6bHp4c3RibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODY0ODcsImV4cCI6MjA3NDI2MjQ4N30.o8dnVeL_2YR9BhV_oFscgBDizgdjs61jfOMHkcPiCyE
```

## Option 2: Use app.json (Alternative)

Add to your `app.json`:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://fwcktzrwaazlzxstbnbp.supabase.co",
      "supabaseAnonKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Y2t0enJ3YWF6bHp4c3RibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODY0ODcsImV4cCI6MjA3NDI2MjQ4N30.o8dnVeL_2YR9BhV_oFscgBDizgdjs61jfOMHkcPiCyE"
    }
  }
}
```

## Current Status

✅ **Your Supabase credentials are already configured in the code as fallbacks**
✅ **The app will work immediately without additional setup**

## Next Steps

1. **Set up your Supabase database** (see SUPABASE_SETUP.md)
2. **Run the SQL scripts** to create tables and seed data
3. **Test the app** - it should now connect to your Supabase project

## Security Note

For production, always use environment variables instead of hardcoded credentials.
