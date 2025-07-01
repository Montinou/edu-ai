#!/bin/bash
# Quick script to set new Supabase environment variables in Vercel
# Replace the values below with your actual Supabase credentials

# Set your new Supabase credentials here:
SUPABASE_URL="https://your-new-project-id.supabase.co"
SUPABASE_ANON_KEY="your_new_anon_key_here"  
SUPABASE_SERVICE_KEY="your_new_service_role_key_here"

echo "🔧 Setting Supabase environment variables in Vercel..."

# Set environment variables for production
echo "📝 Setting NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "📝 Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "📝 Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "✅ Environment variables updated!"
echo "🚀 Now run: vercel --prod to redeploy with new variables" 