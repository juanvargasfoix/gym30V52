# SUPABASE SETUP GUIDE - GYM 3.0

This document outlines the steps to initialize the Supabase backend for GYM 3.0.

## 1. Environment Configuration
Update your `.env.local` file with the credentials from your Supabase project dashboard (Settings -> API).

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Database Schema Initialization
1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Create a **New Query**.
4. Copy the entire content of `supabase/schema.sql` and paste it into the editor.
5. Click **Run**.

## 3. Verification
After running the script, verify that the following tables appear in the **Table Editor**:
- `companies`
- `profiles`
- `skills`
- `user_progress`
- `kudos`

## 4. Initial User Creation
You can create your first admin user directly from the Supabase Dashboard:
1. Go to **Authentication** -> **Users** -> **Add User**.
2. Go to **Table Editor** -> **profiles**.
3. Insert a new row with the **ID** from the Auth user, your desired **username**, and set **role** to `'admin'`.

## 5. Troubleshooting & Rollback
- **Missing Env Vars**: If the app fails to start, ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are defined in `.env.local`.
- **Auth Errors**: Check the Browser Console. Our error handler provides readable messages for common issues.
- **Temporary Rollback**: The app still supports `localStorage`. If Supabase is unavailable, you can still log in using the local mock users defined in `data.ts`.

## 6. Next Steps
Once your first users are logged in via Supabase, we will proceed to **Phase 4B-2: Progress Migration**, where we will move user skill results to the cloud.
