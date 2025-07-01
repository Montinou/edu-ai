-- ============================================
-- SUPABASE STORAGE SETUP FOR EDUCARD AI
-- ============================================

-- El bucket 'cards.images' ya existe, no necesitamos crearlo
-- Solo verificamos que exista

-- Create storage bucket for generated images cache
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760,  -- 10MB limit for high-quality generated images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user uploads (future use)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-content',
  'user-content',
  false,  -- Private bucket
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy for cards.images bucket (public read, admin write)
CREATE POLICY "Public read access for card images" ON storage.objects 
FOR SELECT USING (bucket_id = 'cards.images');

CREATE POLICY "Admin write access for card images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'cards.images' AND auth.role() = 'service_role');

-- Policy for generated-images bucket (public read, system write)
CREATE POLICY "Public read access for generated images" ON storage.objects 
FOR SELECT USING (bucket_id = 'generated-images');

CREATE POLICY "System write access for generated images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'generated-images');

-- Policy for user-content bucket (user-specific access)
CREATE POLICY "User access to own content" ON storage.objects 
FOR ALL USING (bucket_id = 'user-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- IMAGE CACHE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  provider TEXT NOT NULL,
  cost DECIMAL(10,4) DEFAULT 0.0,
  processing_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster cache lookups
CREATE INDEX idx_image_cache_key ON image_cache(cache_key);
CREATE INDEX idx_image_cache_created ON image_cache(created_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get public URL for storage objects
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name text, file_path text)
RETURNS TEXT AS $$
BEGIN
  RETURN format('https://%s.supabase.co/storage/v1/object/public/%s/%s', 
    current_setting('app.settings.project_id'), bucket_name, file_path);
END;
$$ LANGUAGE plpgsql;

-- Function to clean old cache entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_image_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM image_cache 
  WHERE created_at < NOW() - INTERVAL '7 days'
  AND access_count < 5;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if buckets were created successfully
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id IN ('cards.images', 'generated-images', 'user-content');

-- Check storage policies
SELECT 
  policyname,
  tablename,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'; 