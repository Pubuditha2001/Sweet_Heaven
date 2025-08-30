import React from "react";

export default function ActionResultPopUp({
  show,
  mode = "confirm", // 'confirm' | 'reject'
  status = "prompt", // 'prompt' | 'pending' | 'success' | 'failed'
  message = "",
  onClose,
  onConfirm,
  title,
  imageSrcSuccess = "/confirmed.png",
  imageSrcRejected = "/rejected.png",
  imageSrcFailed = "/failed.png",
  children,
}) {
  if (!show) return null;

  const displayedTitle =
    title || (mode === "reject" ? "Reject order" : "Confirm order");

  const btnLabel = mode === "reject" ? "Reject" : "Confirm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm text-xl"
        >
          ✕
        </button>

        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
          <div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
            {status === "pending" ? (
              <img
                src="/loading.png"
                alt="loading"
                className="w-16 h-16 object-contain animate-spin"
              />
            ) : status === "success" ? (
              <img
                src={mode === "reject" ? imageSrcRejected : imageSrcSuccess}
                alt={mode === "reject" ? "rejected" : "success"}
                className="w-16 h-16 object-cover rounded"
              />
            ) : status === "failed" ? (
              <img
                src={imageSrcFailed}
                alt="failed"
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <img
                src="/idea.png"
                alt="action"
                className="w-16 h-16 object-cover rounded"
              />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
          {displayedTitle}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        {children}

        <div className="flex gap-2 justify-center">
          {status === "prompt" && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  mode === "reject" ? "bg-red-500" : "bg-pink-500"
                }`}
              >
                {btnLabel}
              </button>
            </>
          )}

          {status === "failed" && (
            <>
              <button
                type="button"
                className="flex-1 bg-yellow-400 text-white px-4 py-2 rounded-md"
                onClick={onConfirm}
              >
                Retry
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}

          {status === "success" && (
            <button
              type="button"
              className="w-full bg-pink-100 text-gray-700 px-4 py-2 rounded-md border"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
