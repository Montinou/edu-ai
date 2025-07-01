# 🚀 EduCard AI Database Setup Instructions

## Step 1: Setup Supabase Database

### 1.1 Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 1.2 Run Database Migration
1. Copy the entire contents of `database-migration.sql`
2. Paste it into the SQL Editor
3. Click "Run" to execute the script
4. You should see success messages like:
   ```
   🎉 EduCard AI Database Schema created successfully!
   ✅ All tables, views, and security policies are ready
   🚀 Ready to generate and store cards!
   ```

## Step 2: Test Database Connection

Run this command to verify your connection:
```bash
node scripts/test-supabase.js
```

Expected output:
```
🔍 Testing Supabase Connection...
Environment Variables:
SUPABASE_URL: ✅ SET
SUPABASE_ANON_KEY: ✅ SET
🧪 Testing database connection...
✅ Successfully connected to Supabase!
📊 Found 0 records in cards table
```

## Step 3: Generate Cards

Now run the card generation system:
```bash
node scripts/generate-cards.js
```

This will:
- Create 8 educational cards based on CARD_PROMT.md
- Generate curated math problems for each card
- Store everything in your Supabase database

## Step 4: Verify Results

Check that cards were created:
```bash
node scripts/test-supabase.js
```

You should now see:
```
📊 Found 8 records in cards table
```

## 🎯 Troubleshooting

### If you get "tables don't exist" error:
- Make sure you ran the database migration script in Supabase SQL Editor
- Check that all tables were created successfully

### If you get connection errors:
- Verify your environment variables in `.env.local`
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### If you get rate limit errors:
- The script now uses curated problems instead of AI generation
- Wait a few minutes and try again if needed

## 🎉 Success!

Once complete, you'll have:
- ✅ Complete database schema
- ✅ 8 educational cards with math problems
- ✅ Ready for UI development

Your EduCard AI platform is now ready for the next phase! 🚀 