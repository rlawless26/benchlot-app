-- This script creates the necessary storage buckets and policies for profile images
-- Run this in the Supabase SQL Editor
-- Note: If you get an error about storage.policies table not existing,
-- you may need to use the Supabase Storage UI to create buckets and policies
-- instead of running this SQL directly.

-- Create profiles bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Now create policies using Supabase's storage.policies table

-- Create policy for profile bucket - public read access
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Public Read Access', 
  '(role() = ''anon''::text)', 
  'profiles',
  'SELECT'
);

-- Create policy for profile bucket - authenticated users can insert
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Auth Users Insert', 
  '(role() = ''authenticated''::text)', 
  'profiles',
  'INSERT'
);

-- Create policy for avatars bucket - public read access
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Public Read Access', 
  '(role() = ''anon''::text)', 
  'avatars',
  'SELECT'
);

-- Create policy for avatars bucket - authenticated users can insert
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Auth Users Insert', 
  '(role() = ''authenticated''::text)', 
  'avatars',
  'INSERT'
);

-- Create policy for images bucket - public read access
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Public Read Access', 
  '(role() = ''anon''::text)', 
  'images',
  'SELECT'
);

-- Create policy for images bucket - authenticated users can insert
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Auth Users Insert', 
  '(role() = ''authenticated''::text)', 
  'images',
  'INSERT'
);