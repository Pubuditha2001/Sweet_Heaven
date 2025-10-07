import React, { useRef, useState, useEffect } from "react";
import { normalizeImageUrl } from "../utils/imageUtils";
import {
  uploadToCloudinary,
  validateImageFile,
} from "../utils/cloudinaryUpload";

export default function ImageUploader({ value, onChange, multiple = false }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  // multiple: if false, single-image mode; if true, multi-image mode

  if (multiple) {
    const images = Array.isArray(value) ? value : value ? [value] : [];
    const [previews, setPreviews] = useState(images.map(normalizeImageUrl));

    useEffect(() => {
      const next = Array.isArray(value) ? value : value ? [value] : [];
      setPreviews(next.map(normalizeImageUrl));
    }, [value]);

    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Validate file
        validateImageFile(file);
        setError("");
        setUploading(true);
        setUploadProgress(0);

        // Create preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          const tempPreview = reader.result;
          const tempPreviews = [...previews, tempPreview];
          setPreviews(tempPreviews);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, (progress) => {
          setUploadProgress(progress);
        });

        // Update with Cloudinary URL
        const newImages = [...images, result.url];
        const newPreviews = newImages.map(normalizeImageUrl);
        setPreviews(newPreviews);
        onChange(newImages);

        setUploading(false);
        setUploadProgress(0);

        // Reset file input
        e.target.value = "";
      } catch (err) {
        setError(err.message || "Upload failed");
        setUploading(false);
        setUploadProgress(0);
        // Remove temporary preview on error
        setPreviews(images.map(normalizeImageUrl));
      }
    };

    const removeAt = (idx) => {
      const newImages = images.filter((_, i) => i !== idx);
      const newPreviews = newImages.map(normalizeImageUrl);
      setPreviews(newPreviews);
      onChange(newImages);
    };

    return (
      <div className="flex flex-col items-center gap-2">
        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200 w-full text-center">
            {error}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, idx) => (
            <div key={idx} className="relative">
              <img
                src={normalizeImageUrl(p)}
                alt={`Preview ${idx + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-pink-200 shadow"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-sm"
                aria-label={`Remove image ${idx + 1}`}
                disabled={uploading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {uploading && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          type="button"
          className="bg-pink-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Images"}
        </button>
      </div>
    );
  }

  // single-image mode
  const initial =
    typeof value === "string"
      ? value
      : Array.isArray(value) && value.length
      ? value[0]
      : "";
  const [preview, setPreview] = useState(initial);

  useEffect(() => {
    const next =
      typeof value === "string"
        ? value
        : Array.isArray(value) && value.length
        ? value[0]
        : "";
    setPreview(next);
  }, [value]);

  const handleSingleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate file
      validateImageFile(file);
      setError("");
      setUploading(true);
      setUploadProgress(0);

      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });

      // Update with Cloudinary URL
      setPreview(result.url);
      onChange(result.url);

      setUploading(false);
      setUploadProgress(0);

      // Reset file input
      e.target.value = "";
    } catch (err) {
      setError(err.message || "Upload failed");
      setUploading(false);
      setUploadProgress(0);
      // Restore original preview on error
      setPreview(initial);
    }
  };

  const removeSingle = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-200 w-full text-center">
          {error}
        </div>
      )}
      {preview ? (
        <div className="relative">
          <img
            src={normalizeImageUrl(preview)}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-lg border border-pink-200 shadow"
          />
          <button
            type="button"
            onClick={removeSingle}
            className="px-2 absolute -top-2 -right-2 bg-pink-100 rounded-full p-1 shadow text-sm text-red-600"
            aria-label="Remove image"
            disabled={uploading}
          >
            ×
          </button>
        </div>
      ) : null}
      {uploading && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleSingleFileChange}
        disabled={uploading}
      />
      <button
        type="button"
        className="bg-pink-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : preview ? "Change Image" : "Upload Image"}
      </button>
    </div>
  );
}
