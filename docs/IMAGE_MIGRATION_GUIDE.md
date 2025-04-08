# Image Handling Migration Guide

This document outlines how to migrate from the old image handling approach to the new centralized system.

## Overview of the New System

Our new image handling system is designed to be simpler, more reliable, and consistent across all browsers. It features:

- A centralized `ImageService` for all image operations
- Standardized URL patterns and naming conventions
- Simplified components with proper error handling
- Special handling for blob URLs and Supabase storage URLs
- Better fallback mechanisms when images fail to load

## Migration Steps

### 1. Replace Direct URL Manipulation with ImageService

**Old approach:**
```jsx
// Directly manipulating URLs in components
const fixedUrl = url.replace('/authenticated/', '/public/').split('?')[0];
```

**New approach:**
```jsx
import ImageService from '../services/imageService';

// Let the service handle all URL processing
const processedUrl = ImageService.processImageUrl(url);
```

### 2. Use the Simplified Avatar Component

**Old approach:**
```jsx
<UserAvatar user={user} size={32} />
// or
<FixedProfileImage url={profile.avatar_url} size="sm" />
```

**New approach:**
```jsx
import Avatar from '../components/Avatar';

<Avatar
  url={user.profile?.avatar_url}
  userId={user.id}
  name={user.profile?.username || user.email}
  size="sm"
/>
```

### 3. Use the Simplified ToolImage Component

**Old approach:**
```jsx
<img 
  src={fixImageUrl(tool.image_url)} 
  onError={handleImageError}
  alt="Tool"
/>
```

**New approach:**
```jsx
import ToolImage from '../components/ToolImage';

<ToolImage
  url={tool.image_url}
  toolId={tool.id}
  index={0}
  alt={tool.name}
/>
```

### 4. Standardize Image Upload Process

**Old approach:**
```jsx
// Various upload functions with different naming conventions
const uploadProfilePicture = async (file) => {
  const { data } = await supabase.storage
    .from('avatars')
    .upload(`profile-${userId}`, file);
  // ...
};
```

**New approach:**
```jsx
import { uploadAvatar } from '../utils/uploadHelpers';

// Use standardized helper
const handleUpload = async (file) => {
  const { success, url, error } = await uploadAvatar(userId, file);
  if (success) {
    // Use the standardized URL
  }
};
```

### 5. Run the Database Migration Script

To update existing URLs in the database to use our new standardized format:

```bash
node scripts/fixImageUrls.js
```

### 6. Configure Storage Buckets

Ensure storage buckets have the correct permissions:

```bash
node scripts/setupBuckets.js
```

## Components to Remove

Once migration is complete, the following components and utilities can be safely removed:

- `FixedProfileImage.jsx`
- `ReliableImage.jsx`
- `UserAvatar.jsx` (if separate from Avatar)
- Old image utility functions

## Testing Checklist

- [ ] Header avatars display correctly in all browsers
- [ ] Profile pages show avatars correctly
- [ ] Marketplace tools show images correctly
- [ ] Tool detail pages show all images correctly
- [ ] Image uploads work correctly
- [ ] All components gracefully handle missing images with fallbacks

## Troubleshooting

**Images not showing in Safari or Firefox**
- Check browser console for errors
- Verify that blob URLs aren't being modified
- Ensure public URLs are being used instead of authenticated URLs
- Check that there are no duplicate query parameters

**Upload errors**
- Check that storage bucket permissions are configured correctly
- Verify that the file paths follow the new standardized format

## Need Help?

If you encounter issues during migration, refer to the detailed implementation in:
- `src/services/imageService.js`
- `src/components/Avatar.jsx`
- `src/components/ToolImage.jsx`
- `src/utils/uploadHelpers.js`