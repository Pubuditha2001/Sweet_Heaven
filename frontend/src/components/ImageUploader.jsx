import React, { useRef, useState, useEffect } from "react";
import { normalizeImageUrl } from "../utils/imageUtils";

export default function ImageUploader({ value, onChange, multiple = false }) {
  const fileInputRef = useRef();
  // multiple: if false, single-image mode; if true, multi-image mode

  if (multiple) {
    const images = Array.isArray(value) ? value : value ? [value] : [];
    const [previews, setPreviews] = useState(images.map(normalizeImageUrl));

    useEffect(() => {
      const next = Array.isArray(value) ? value : value ? [value] : [];
      setPreviews(next.map(normalizeImageUrl));
    }, [value]);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          const next = [...previews, result];
          setPreviews(next);
          onChange(next, file);
        };
        reader.readAsDataURL(file);
      }
    };

    const removeAt = (idx) => {
      const next = previews.filter((_, i) => i !== idx);
      setPreviews(next);
      onChange(next);
    };

    return (
      <div className="flex flex-col items-center gap-2">
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
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="bg-pink-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-pink-600 transition-colors"
          onClick={() => fileInputRef.current.click()}
        >
          Add Images
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

  const handleSingleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSingle = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
          >
            ×
          </button>
        </div>
      ) : null}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleSingleFileChange}
      />
      <button
        type="button"
        className="bg-pink-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-pink-600 transition-colors"
        onClick={() => fileInputRef.current.click()}
      >
        {preview ? "Change Image" : "Upload Image"}
      </button>
    </div>
  );
}
