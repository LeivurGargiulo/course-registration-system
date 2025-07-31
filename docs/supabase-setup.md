# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Click "New Project"
3. Choose your organization (or create one)
4. Enter project details:
   - **Name**: `course-registration-system`
   - **Database Password**: Choose a strong password and **save it**
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (usually 2-3 minutes)

## Step 2: Get Database Connection String

1. Once your project is ready, click the **"Connect"** button in the top toolbar
2. Go to the **"Connection string"** tab
3. Select **"Transaction pooler"** (recommended for serverless)
4. Copy the URI connection string
5. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1

**Example connection string format:**
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## Step 3: Add to Replit Secrets

1. In your Replit project, go to the **Secrets** tab (lock icon in left sidebar)
2. Add a new secret:
   - **Key**: `DATABASE_URL`
   - **Value**: Your complete Supabase connection string (with password replaced)
3. Click "Add Secret"

## Step 4: Enable Database

Once you've added the DATABASE_URL secret, run this command in the Replit console:

```bash
node scripts/enable-supabase.js
```

This will:
- Test the connection to your Supabase database
- Create all necessary tables (users, courses, commissions, registrations, sessions)
- Add sample course data
- Switch the application to use Supabase instead of in-memory storage

## Step 5: Restart Application

After successful setup, restart your application by running:

```bash
npm run dev
```

## Verification

Your application will now use Supabase for:
- User authentication storage (sessions)
- Course and commission data
- Student registrations
- Admin dashboard statistics

You can verify this works by:
1. Going to your Supabase project dashboard
2. Clicking on "Table Editor" in the left sidebar
3. Seeing the created tables with sample data

## Troubleshooting

If you get connection errors:
1. Double-check your DATABASE_URL secret is correct
2. Ensure you replaced `[YOUR-PASSWORD]` with your actual password
3. Verify you're using the "Transaction pooler" connection string
4. Try creating a new database password in Supabase if connection fails

## Security Notes

- Keep your database password secure
- The connection uses SSL encryption for security
- Only use the Transaction pooler connection string for production apps