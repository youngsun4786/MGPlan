-- Add screenshot_url column to tasks table
ALTER TABLE public.tasks
  ADD COLUMN screenshot_url text;

-- Create screenshots storage bucket (NOT public -- authenticated reads only)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('screenshots', 'screenshots', false)
  ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to screenshots bucket
CREATE POLICY "authenticated users can upload screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'screenshots');

-- RLS: Authenticated users can read screenshots (not public)
CREATE POLICY "authenticated users can read screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'screenshots');
