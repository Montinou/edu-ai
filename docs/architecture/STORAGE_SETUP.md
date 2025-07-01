# 🗄️ EduCard AI - Storage & Image Generation Setup

## Overview
This guide walks you through setting up Supabase Storage for image handling and AI image generation for the EduCard AI platform.

## Current Status
✅ **Cards.images bucket created** - You've already created the main storage bucket  
🔄 **SQL setup needed** - Database tables and policies need to be configured  
🔄 **Image generation ready** - AI services are configured and ready to generate images  

## Step-by-Step Setup

### 1. 📁 Storage Buckets Configuration

You already have `cards.images` bucket created. We need to add additional buckets and configure policies.

In your Supabase Dashboard:
1. Go to **Storage** section
2. Your `cards.images` bucket is already there ✅
3. We'll create additional buckets via SQL

### 2. 🗃️ Run SQL Setup Script

Execute the SQL script to create additional buckets, policies, and cache tables:

```sql
-- Go to Supabase Dashboard > SQL Editor
-- Copy and paste the contents of scripts/setup-supabase-storage.sql
-- Click "Run" to execute
```

The script will:
- Create `generated-images` bucket for AI-generated content
- Create `user-content` bucket for future user uploads
- Set up proper storage policies for security
- Create `image_cache` table for optimization
- Add helper functions for image management

### 3. 🔑 Environment Variables

Ensure these environment variables are configured:

#### Required (Supabase):
```env
NEXT_PUBLIC_SUPABASE_URL=https://lfeobvjrescqzdjnsard.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Optional (AI Image Generation):
```env
# HuggingFace (Free) - Recommended for development
HUGGINGFACE_API_KEY=hf_your_token_here

# Replicate (Premium) - For high-quality images
REPLICATE_API_TOKEN=r8_your_token_here
```

### 4. 🧪 Test the Setup

1. Navigate to `/admin/storage` in your application
2. Click "Test Connection" to verify storage access
3. Click "Test Upload" to verify upload functionality
4. Review the status indicators

### 5. 🖼️ Generate Card Images

Once testing passes:

1. Go to `/admin/storage`
2. Click "Generate All Images" 
3. Wait for the generation process to complete
4. Check the results and view generated images
5. Verify images appear in the card collection

## Image Generation Process

### How it Works:
1. **Card Analysis**: System reads card data (name, type, rarity, problem type)
2. **Prompt Generation**: Creates AI-optimized prompts for each card
3. **AI Generation**: Uses HuggingFace/Pollinations/Replicate APIs
4. **Image Processing**: Resizes and optimizes images (512x768px)
5. **Storage Upload**: Saves to Supabase Storage with metadata
6. **Database Update**: Updates card record with image URL

### Providers Used:
- **HuggingFace**: Free tier, good for common/rare cards
- **Pollinations**: Free unlimited, reliable backup
- **Replicate**: Premium quality for epic/legendary cards

## Storage Structure

```
Buckets:
├── cards.images/          # Main card images (public)
│   └── cards/
│       ├── card-001.jpg
│       └── card-002.jpg
├── generated-images/      # AI-generated cache (public)
│   ├── huggingface/
│   ├── pollinations/
│   └── replicate/
└── user-content/          # User uploads (private)
    └── {user-id}/
```

## Troubleshooting

### Storage Connection Issues:
- ✅ Verify bucket `cards.images` exists
- ✅ Check SUPABASE_SERVICE_ROLE_KEY is set
- ✅ Confirm Supabase project URL is correct

### Image Generation Issues:
- ✅ Verify HUGGINGFACE_API_KEY is valid
- ✅ Check API rate limits
- ✅ Review console logs for detailed errors
- ✅ Try different providers (HuggingFace → Pollinations)

### Upload Errors:
- ✅ Check storage policies are created
- ✅ Verify file size limits (5MB for cards)
- ✅ Confirm MIME types are allowed

## Security Notes

- **Public Buckets**: `cards.images` and `generated-images` are public for CDN access
- **Private Bucket**: `user-content` requires authentication
- **Policies**: Only service role can write, anyone can read public buckets
- **File Limits**: 5MB for card images, 10MB for generated images

## Monitoring

### Storage Stats Available:
- Total images stored
- Storage space used
- Generation success rates
- API costs and usage
- Cache hit ratios

### Access via Admin Panel:
- Real-time storage status
- Image generation results
- Upload test functionality
- Bucket management

## Next Steps

After setup completion:

1. ✅ **Test thoroughly** - Verify all functionality works
2. 🎨 **Generate images** - Create images for all existing cards  
3. 🔄 **Monitor usage** - Track generation costs and performance
4. 📊 **Optimize prompts** - Improve image quality based on results
5. 🚀 **Deploy to production** - Push changes to live environment

## Support

If you encounter issues:
1. Check the admin panel at `/admin/storage`
2. Review browser console for error messages
3. Verify all environment variables are set
4. Test with individual card generation first
5. Check Supabase Storage logs for upload errors

The system is designed to gracefully handle failures and fallback to placeholder images when needed. 