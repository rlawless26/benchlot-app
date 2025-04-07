# Supabase Storage Setup Guide

Since you already have `tool-images` (with a tools folder) and `user-images` (with an avatars folder) buckets, we'll adapt our approach to use these existing buckets instead of creating new ones.

## Check Existing Buckets

1. Log in to your Supabase Dashboard
2. Navigate to the Storage section in the left sidebar
3. Verify that the following buckets exist:
   - `tool-images` (for tool images)
   - `user-images` (for avatar/profile images)
4. Make sure both buckets are marked as "Public bucket" to allow public access

## Set Up or Update Policies

For each bucket, you'll need to ensure they have the following policies:

### Policy 1: Public Read Access

This allows anyone (including non-logged-in users) to view images.

1. Click on the bucket
2. Go to the "Policies" tab
3. Check if there's already a policy allowing anonymous read access
4. If not, click "Add Policies" button
5. Select "Get started quickly"
6. Choose "Allow anonymous access to read"
7. Click "Use this template"
8. Name the policy "Public Read Access"
9. Save the policy

### Policy 2: Authenticated Upload Access

This allows logged-in users to upload images.

1. Click on the bucket
2. Go to the "Policies" tab
3. Check if there's already a policy allowing authenticated users to upload
4. If not, click "Add Policies" button
5. Select "Get started quickly"
6. Choose "Allow access to authenticated users only"
7. Select "INSERT" from the dropdown
8. Click "Use this template"
9. Name the policy "Auth Users Insert"
10. Save the policy

## Update the uploadProfileImage Function

Based on your existing bucket structure, you'll need to modify the `uploadProfileImage` function to use your existing buckets. The current code is set up to try:
- `profiles` bucket
- `avatars` bucket
- `images` bucket with `avatars/` prefix

We'll update this to:
- `user-images` bucket with the `avatars/` prefix (primary)
- `tool-images` bucket with `avatars/` prefix (fallback)

Let's make this change now.