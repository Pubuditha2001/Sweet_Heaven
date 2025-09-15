import React from "react";

export default function UnsavedChangesModal({
  show,
  saving,
  onClose,
  onSave,
  onDiscard,
  title = "You're being redirected",
  description = "Would you like to save your changes before leaving? You can edit the item afterwards.",
  imageSrc = "/idea.png",
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
          <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
            <img src={imageSrc} alt="Unsaved changes" className="w-16 h-16" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            className="bg-green-400 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            onClick={onSave}
          >
            {saving ? "Saving..." : "Save and Leave"}
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={onDiscard}
          >
            Discard and Leave
          </button>
          <button
            type="button"
            className="bg-pink-100 text-gray-700 px-4 py-2 rounded-md border"
            onClick={onClose}
          >
            Stay on this page
          </button>
        </div>
      </div>
    </div>
  );
}
