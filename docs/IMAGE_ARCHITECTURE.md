# Image Handling Architecture

This document outlines the image handling architecture in the Benchlot application.

## Overview

The image handling system is designed to be simple, reliable, and consistent across all browsers. It follows these key principles:

1. **Centralized Logic**: All image URL processing is handled by a single service
2. **Standardized Naming**: Consistent file paths and naming conventions
3. **Special Handling**: Different handling for blob URLs vs. Supabase storage URLs
4. **Robust Fallbacks**: Graceful degradation when images fail to load

## Core Components

### 1. ImageService

The `ImageService` centralizes all image-related operations:

```jsx
// src/services/imageService.js
import ImageService from '../services/imageService';

// Get a public URL for storage bucket
const url = ImageService.getPublicUrl('bucket', 'path/file.jpg');

// Get an avatar URL
const avatarUrl = ImageService.getAvatarUrl(userId);

// Process any URL type
const processedUrl = ImageService.processImageUrl(url);

// Get initials for fallback
const initials = ImageService.getInitials('User Name');
```

### 2. Avatar Component

The `Avatar` component handles user profile images with graceful degradation:

```jsx
// src/components/Avatar.jsx
import Avatar from '../components/Avatar';

<Avatar
  url={profile.avatar_url}
  userId={profile.id}
  name={profile.username}
  size="md"
  className="rounded-full"
/>
```

### 3. ToolImage Component

The `ToolImage` component displays tool listings with fallbacks:

```jsx
// src/components/ToolImage.jsx
import ToolImage from '../components/ToolImage';

<ToolImage
  url={tool.image_url}
  toolId={tool.id}
  index={0}
  alt={tool.name}
  className="aspect-square"
/>
```

### 4. Upload Helpers

The `uploadHelpers` module standardizes image upload operations:

```jsx
// src/utils/uploadHelpers.js
import { uploadAvatar, uploadToolImage } from '../utils/uploadHelpers';

// Upload avatar
const { success, url, error } = await uploadAvatar(userId, file);

// Upload tool image
const result = await uploadToolImage(toolId, file, 0);
```

## URL Handling Details

### 1. Blob URLs

Blob URLs are never modified and are passed through as-is:

```javascript
// Special handling for blob URLs
if (url.startsWith('blob:')) {
  console.log('Using blob URL directly without modification:', url);
  return url;
}
```

### 2. Storage URLs

Storage URLs are cleaned and ensured to use the public endpoint:

```javascript
// Handle storage URLs to ensure they're public and clean
if (url.includes('/storage/v1/')) {
  // Remove any existing query parameters
  const baseUrl = url.split('?')[0];
  
  // Ensure it's using the public endpoint
  return baseUrl.replace('/storage/v1/object/authenticated', '/storage/v1/object/public');
}
```

### 3. Cache Busting

Standard URLs (non-blob) get cache busting parameters:

```javascript
// Add cache busting for non-blob URLs
if (!url.startsWith('blob:') && !url.includes('?')) {
  return `${url}?t=${Date.now()}`;
}
```

## Fallback Mechanisms

Both Avatar and ToolImage components implement graceful degradation:

1. **Avatars**: Fall back to user initials in a colored circle
2. **Tool Images**: Fall back to a placeholder image icon
3. **Error Handling**: Both components capture and handle load errors

## Migration Scripts

Two scripts are provided to help with migration:

1. **setupBuckets.js**: Configures storage buckets with proper permissions
2. **fixImageUrls.js**: Updates existing database URLs to the standardized format

## Best Practices

1. Always use the ImageService to process URLs
2. Use the Avatar and ToolImage components instead of raw `<img>` tags
3. Use the upload helpers for consistent file paths and naming
4. Let components handle errors and fallbacks rather than implementing custom fallback logic

## Troubleshooting

If images aren't displaying correctly:

1. Check browser console for errors
2. Verify the URL is formatted correctly using ImageService.processImageUrl()
3. Ensure blob URLs aren't being modified
4. Check that storage bucket permissions are configured correctly
5. Verify that the file exists at the expected path