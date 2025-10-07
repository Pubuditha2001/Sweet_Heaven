// utils/testCloudinary.js
// Utility for testing Cloudinary integration

import { uploadToCloudinary, validateImageFile } from "./cloudinaryUpload";

export const testCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const errors = [];

  if (!cloudName) {
    errors.push("VITE_CLOUDINARY_CLOUD_NAME is not set");
  }

  if (!uploadPreset) {
    errors.push("VITE_CLOUDINARY_UPLOAD_PRESET is not set");
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      cloudName,
      uploadPreset: uploadPreset ? "***" : undefined,
    },
  };
};

export const createTestFile = () => {
  // Create a small test image (1x1 pixel PNG)
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF69B4"; // Pink color for Sweet Heaven theme
  ctx.fillRect(0, 0, 1, 1);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "test-image.png", { type: "image/png" });
      resolve(file);
    }, "image/png");
  });
};

export const runCloudinaryTest = async () => {
  console.log("🧪 Running Cloudinary integration test...");

  // Test 1: Configuration validation
  const configTest = testCloudinaryConfig();
  console.log("📋 Configuration test:", configTest);

  if (!configTest.isValid) {
    return {
      success: false,
      error: "Configuration invalid: " + configTest.errors.join(", "),
    };
  }

  try {
    // Test 2: File validation
    const testFile = await createTestFile();
    console.log("📁 Created test file:", testFile);

    validateImageFile(testFile);
    console.log("✅ File validation passed");

    // Test 3: Upload test
    console.log("☁️ Testing upload to Cloudinary...");
    const result = await uploadToCloudinary(testFile, (progress) => {
      console.log(`📊 Upload progress: ${progress}%`);
    });

    console.log("🎉 Upload successful:", result);

    return {
      success: true,
      result: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Usage in browser console:
// import { runCloudinaryTest } from './utils/testCloudinary';
// runCloudinaryTest().then(result => console.log('Test result:', result));
