# Cloudinary Integration Setup for Sweet Heaven

## 🔧 Environment Configuration

### Frontend (.env)

```env
# These variables are required for the frontend to upload images to Cloudinary
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Backend (.env)

```env
# These variables are required for backend Cloudinary operations
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📁 Recommended Directory Structure

```
SweetHeaven/
├── production/
│   ├── cakes/
│   │   ├── (auto create for cake name)/main, gallery
│   ├── toppings/
│   │   ├── (auto create directory for the topping collection name)
│   └── accessories/
└── development/
    ├── cakes/
    │   ├── (auto create for cake name)/main, gallery
    ├── toppings/
    │   ├── (auto create directory for the topping collection name)
    └── accessories/
```

### Environment-Based Structure

```
production/
├── cakes/
├── toppings/
└── accessories/

development/
├── cakes/
├── toppings/
└── accessories/
```

## 🎯 Directory Management Best Practices

### **1. Product Type Separation**

- **Cakes**: Organized by category (birthday, wedding, custom)
- **Toppings**: Grouped by type (fruits, chocolates, nuts)
- **Accessories**: By function (candles, decorations, boxes)

### **2. Naming Conventions**

- Use lowercase, hyphen-separated names
- Example: `birthday-cakes`, `chocolate-toppings`
- Avoid spaces and special characters

### **3. Dynamic Folder Assignment**

```javascript
// Example folder structure in upload
folder: `sweet-heaven/production/cakes/${cake.category}`;
folder: `sweet-heaven/production/toppings/${topping.collectionName}`;
folder: `sweet-heaven/production/accessories/${accessory.category}`;

// Development environment
folder: `sweet-heaven/development/cakes/${cake.category}`;
folder: `sweet-heaven/development/toppings/${topping.collectionName}`;
folder: `sweet-heaven/development/accessories/${accessory.category}`;
```

### **4. Automated Directory Creation**

Cloudinary automatically creates directories when uploading files with folder paths:

```javascript
// Environment-aware folder generation
const generateFolderPath = (productType, category) => {
  const environment =
    process.env.NODE_ENV === "production" ? "production" : "development";
  const baseFolder = `sweet-heaven/${environment}`;

  switch (productType) {
    case "cake":
      return `${baseFolder}/cakes/${category || "general"}`;
    case "topping":
      return `${baseFolder}/toppings/${category || "general"}`;
    case "accessory":
      return `${baseFolder}/accessories/${category || "general"}`;
    default:
      return `${baseFolder}/general`;
  }
};
```

### **5. Benefits**

- **Organization**: Easy to locate specific product images
- **Performance**: Faster search and filtering
- **Marketing**: Category-specific galleries and content
- **Maintenance**: Bulk operations and cleanup
- **Analytics**: Better usage tracking per category
- **Environment Separation**: Clean dev/prod isolation
- **Auto-Creation**: Folders created automatically on upload

## 🤖 Automated Directory Creation

### **How It Works**

Cloudinary automatically creates directories when you upload files with folder paths. The folder structure `sweet-heaven/production` and `sweet-heaven/development` is already set up, and subdirectories are created dynamically based on product data.

### **Implementation Examples**

```javascript
// Cake uploads automatically create: sweet-heaven/production/cakes/birthday/
// Topping uploads automatically create: sweet-heaven/production/toppings/chocolate-collection/
// Accessory uploads automatically create: sweet-heaven/production/accessories/candles/
```

### **Environment Detection**

```javascript
// Automatically uses correct environment folder
const env =
  import.meta.env.MODE === "production" ? "production" : "development";
const folderPath = `sweet-heaven/${env}/cakes/${cakeName}`;
```

## Setup Instructions:

## 📝 Setup Instructions:

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Create an upload preset in Cloudinary settings:
   - Go to Settings > Upload presets
   - Create a new preset or use an existing one
   - Make sure it's set to "Unsigned" for frontend uploads
   - Configure folder structure and transformations as needed
4. Update both frontend and backend .env files with your credentials
5. Restart both development servers after updating environment variables

## 🔐 Security Notes:

## 🔐 Security Notes:

- Upload preset should be unsigned for frontend direct uploads
- API secret should only be used on the backend
- Consider setting up folder restrictions and file size limits in Cloudinary
- Use different presets for different environments (dev/staging/production)

## 🌟 Additional Recommendations:

### **Upload Presets Configuration**

- Create separate presets for each product type
- Set appropriate transformations and quality settings
- Configure folder auto-assignment based on preset

### **Image Management**

- Store original + optimized versions
- Use Cloudinary transformations for different sizes
- Keep thumbnails, medium, and full-size variants

### **Cleanup Strategy**

- Implement regular cleanup of unused images
- Track image usage in your database
- Archive old product images instead of deleting

### **Performance Optimization**

- Use appropriate image formats (WebP, AVIF when supported)
- Implement lazy loading for image galleries
- Set up proper caching headers
