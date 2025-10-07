// utils/cloudinaryDebug.js
// Debugging utility for Cloudinary issues

export const debugCloudinaryConfig = () => {
  const config = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  };

  console.group("🔧 Cloudinary Configuration Debug");
  console.log("Environment Variables:", config);
  console.log("Cloud Name Present:", !!config.cloudName);
  console.log("Upload Preset Present:", !!config.uploadPreset);
  console.log("Mode:", config.mode);
  console.log("Is Development:", config.dev);
  console.log("Is Production:", config.prod);

  if (!config.cloudName) {
    console.error("❌ VITE_CLOUDINARY_CLOUD_NAME is missing");
  } else {
    console.log("✅ Cloud Name:", config.cloudName);
  }

  if (!config.uploadPreset) {
    console.error("❌ VITE_CLOUDINARY_UPLOAD_PRESET is missing");
  } else {
    console.log("✅ Upload Preset: [HIDDEN]");
  }

  console.groupEnd();

  return config;
};

export const debugCloudinaryUpload = async (file) => {
  console.group("🚀 Cloudinary Upload Debug");

  const config = debugCloudinaryConfig();

  if (!config.cloudName || !config.uploadPreset) {
    console.error("❌ Cannot proceed with upload - missing configuration");
    return null;
  }

  console.log("📁 File Info:", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  formData.append("cloud_name", config.cloudName);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  console.log("🌐 Upload URL:", uploadUrl);
  console.log("📋 FormData entries:");
  for (let pair of formData.entries()) {
    if (pair[0] === "file") {
      console.log("  file:", pair[1].name, pair[1].size, "bytes");
    } else {
      console.log("  " + pair[0] + ":", pair[1]);
    }
  }

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log("📡 Response Status:", response.status);
    console.log(
      "📡 Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("📡 Response Body:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("✅ Upload Successful:", {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      });
      console.groupEnd();
      return data;
    } else {
      console.error("❌ Upload Failed");
      try {
        const errorData = JSON.parse(responseText);
        console.error("Error Details:", errorData);
      } catch (e) {
        console.error("Raw Error Response:", responseText);
      }
      console.groupEnd();
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
    console.groupEnd();
    throw error;
  }
};

export const createTestImage = () => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");

    // Create a simple gradient
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, "#FF69B4");
    gradient.addColorStop(1, "#9370DB");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);

    // Add some text
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("TEST", 50, 30);
    ctx.fillText("IMAGE", 50, 50);
    ctx.fillText(new Date().toLocaleTimeString(), 50, 70);

    canvas.toBlob((blob) => {
      const file = new File([blob], "test-image.png", { type: "image/png" });
      resolve(file);
    }, "image/png");
  });
};

// Add this to any component to test Cloudinary
export const runCloudinaryTest = async () => {
  console.log("🧪 Starting Cloudinary Debug Test");

  try {
    const testFile = await createTestImage();
    const result = await debugCloudinaryUpload(testFile);

    if (result) {
      console.log("🎉 Test completed successfully!");
      alert("Cloudinary test successful! Check console for details.");
    }
  } catch (error) {
    console.error("💥 Test failed:", error);
    alert("Cloudinary test failed! Check console for details.");
  }
};
