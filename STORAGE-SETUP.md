# Benchlot Storage Setup Guide

This guide provides instructions for setting up Supabase storage for the Benchlot application.

## Overview

Benchlot uses Supabase Storage for storing:
- User profile images (avatars)
- Tool listing images

## Setup Instructions

### 1. Configure Buckets using the Admin Script

The easiest way to set up the storage buckets is to use the provided script:

```bash
# Install dependencies if you haven't already
npm install @supabase/supabase-js dotenv

# Create a .env file with your Supabase URL and service role key
echo "SUPABASE_URL=https://tavhowcenicgowmdmbcz.supabase.co" > .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" >> .env

# Run the setup script
node setup-storage-policies.js
```

### 2. Manual Setup (Alternative)

If you prefer to set up storage manually through the Supabase dashboard:

#### Create and Configure Buckets

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to the Storage section in the sidebar
4. Create two buckets:
   - `user-images` (for profile images)
   - `tool-images` (for tool listing images)
5. Make sure both buckets are marked as "Public"

#### Set Up Storage Policies

For each bucket, create the following policies:

##### User-Images Bucket

1. Add a policy for anonymous read access:
   - Name: "Public Read Access"
   - Allowed operations: SELECT
   - FOR role: anon
   - USING expression: true

2. Add a policy for authenticated users to upload:
   - Name: "Auth Insert Policy"
   - Allowed operations: INSERT
   - FOR role: authenticated
   - USING expression: true

##### Tool-Images Bucket

Set up the same policies as for user-images.

### 3. Create Required Folders

In your buckets, create the following folders:

1. In the `user-images` bucket:
   - Create an `avatars` folder

2. In the `tool-images` bucket:
   - Create a `tools` folder

## CORS Configuration

If you experience CORS issues with image loading, you'll need to configure CORS for your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Scroll down to the CORS section
4. Add your application domains (including localhost for development):
   - `http://localhost:3000`
   - `https://localhost:3000`
   - `https://www.benchlot.com`
   - `https://benchlot.com`
5. Make sure "Expose Content-Range header" is checked
6. Click Save

## Testing Storage Setup

You can test your storage configuration with the provided debug script:

```bash
node debug-storage.js
```

This will output the current storage configuration and test accessibility.

## Troubleshooting

### Images Not Loading

If profile images aren't loading:

1. Check browser console for error messages
2. Make sure CORS is properly configured
3. Verify that policies are correctly set up
4. Try clearing browser cache
5. Use the FixEnvironment tool at `/diagnostics` to reset the environment

### 400 Bad Request Errors

If you see 400 errors when loading images:

1. Make sure the bucket is set to "public"
2. Verify the anon policy exists and is set to true
3. Check that the image path is correct in the database
4. Confirm that the bucket name in the URL matches the actual bucket name

### CORS Errors

If you see CORS errors in the console:

1. Follow the CORS configuration steps above
2. Add any additional domains where your app is hosted
3. Make sure "Allow credentials" is enabled if your app uses cookies

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Permissions Guide](https://supabase.com/docs/guides/storage/security)
- [CORS Configuration Guide](https://supabase.com/docs/guides/api/cors)