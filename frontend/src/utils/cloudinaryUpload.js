// utils/cloudinaryUpload.js
// Frontend utility for uploading images to Cloudinary

export const uploadToCloudinary = async (file, onProgress = null) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration missing. Please check environment variables."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes,
            });
          } catch (parseError) {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      );
      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const uploadMultipleToCloudinary = async (files, onProgress = null) => {
  const uploadPromises = files.map((file, index) => {
    return uploadToCloudinary(file, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

// Helper function to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const regex = /\/v\d+\/(.+?)(?:\.[^.]+)?$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper function to validate file types
export const validateImageFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload JPEG, PNG, WebP, or GIF images."
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      "File size too large. Please upload images smaller than 10MB."
    );
  }

  return true;
};
