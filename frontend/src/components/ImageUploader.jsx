import React, { useRef, useState, useEffect } from "react";

export default function ImageUploader({ value, onChange }) {
  const fileInputRef = useRef();
  const [preview, setPreview] = useState("");

  // Always show the value as preview unless a new file is uploaded
  useEffect(() => {
    if (!value) {
      setPreview("");
      return;
    }
    // If value is a relative path, convert to public URL
    if (typeof value === "string" && value.startsWith("./")) {
      setPreview(value.replace(/^\.\//, "/"));
    } else {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
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

  return (
    <div className="flex flex-col items-center gap-2">
      {preview && (
        <img
          src={preview}
          alt="Cake Preview"
          className="w-40 h-40 object-cover rounded-lg border border-pink-200 shadow"
        />
      )}
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
        {preview ? "Change Image" : "Upload Image"}
      </button>
    </div>
  );
}
