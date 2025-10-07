# Cloudinary 400 Error Troubleshooting Guide

## 🚨 Common Causes of 400 Bad Request Error

### 1. **Missing Environment Variables**

The most common cause is missing or incorrectly set environment variables in production.

**Solution:**
Check that these variables are set in your deployment environment:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 2. **Incorrect Upload Preset Configuration**

The upload preset might not be configured correctly in Cloudinary.

**Solution:**

1. Go to Cloudinary Dashboard → Settings → Upload
2. Find your upload preset
3. Ensure it's set to **"Unsigned"** (required for frontend uploads)
4. Check that the preset name matches exactly

### 3. **Cloud Name Mismatch**

The cloud name in environment variables doesn't match your Cloudinary account.

**Solution:**

1. Go to Cloudinary Dashboard
2. Copy the exact "Cloud name" from the dashboard
3. Update your environment variable to match exactly

### 4. **File Validation Issues**

The file might be too large or have an unsupported format.

**Solution:**

- Check file size (should be < 10MB)
- Ensure file type is supported (JPEG, PNG, WebP, GIF)
- Validate the file is not corrupted

### 5. **FormData Configuration**

Incorrect FormData setup can cause 400 errors.

**Fixed in Latest Version:**

- Removed unnecessary `cloud_name` from FormData
- Added proper file validation
- Enhanced error reporting

## 🔧 How to Debug

### Step 1: Check Environment Variables

Add this to any component in production:

```javascript
console.log("Cloudinary Config:", {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    ? "SET"
    : "MISSING",
});
```

### Step 2: Use the Built-in Tester

1. Go to Admin Dashboard
2. Add `?debug=cloudinary` to the URL (e.g., `yourdomain.com/admin?debug=cloudinary`)
3. Use the Cloudinary Tester component

### Step 3: Check Network Tab

1. Open browser DevTools
2. Go to Network tab
3. Try uploading an image
4. Look at the failed request for detailed error messages

## 🎯 Quick Fixes

### Fix 1: Update Environment Variables

Make sure your deployment platform (Railway, Vercel, Netlify, etc.) has these variables set:

```
VITE_CLOUDINARY_CLOUD_NAME=ddcjmsh0p
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

### Fix 2: Check Upload Preset Settings

In Cloudinary Dashboard:

1. Settings → Upload → Upload presets
2. Find your preset
3. Set Mode to "Unsigned"
4. Save changes

### Fix 3: Verify Cloud Name

Your cloud name should be exactly: `ddcjmsh0p` (based on the error URL)

### Fix 4: Test with Curl

Test the upload preset directly:

```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/ddcjmsh0p/image/upload \
  -F 'upload_preset=your_preset_name' \
  -F 'file=@/path/to/test/image.jpg'
```

## 🚀 Deployment-Specific Solutions

### GitHub Pages / Static Deployment

Ensure environment variables are built into the static files during build time:

```yaml
# In GitHub Actions workflow
env:
  VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.VITE_CLOUDINARY_CLOUD_NAME }}
  VITE_CLOUDINARY_UPLOAD_PRESET: ${{ secrets.VITE_CLOUDINARY_UPLOAD_PRESET }}
```

### Railway

Set environment variables in Railway dashboard:

1. Go to your project
2. Variables tab
3. Add the VITE\_ variables

### Vercel/Netlify

Set environment variables in your platform's dashboard.

## ⚡ Immediate Action Items

1. **Check GitHub Secrets:** Ensure secrets are set in repository settings
2. **Verify Cloudinary Preset:** Must be "unsigned" for frontend uploads
3. **Test in Production:** Use the debug component to verify config
4. **Check Console:** Look for specific error messages
5. **Validate File:** Try with a small PNG file first

## 📞 If Still Not Working

1. Check Cloudinary account quota/limits
2. Verify upload preset exists and is active
3. Test with a minimal HTML page to isolate the issue
4. Check for any CORS policies in Cloudinary settings
