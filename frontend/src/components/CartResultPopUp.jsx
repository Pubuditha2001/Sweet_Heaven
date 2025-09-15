export default function CartResultPopUp({
  show,
  status = "pending", // 'pending' | 'success' | 'failed'
  message = "",
  onClose,
  onRetry,
  onAddAccessories,
  onBuyAnother,
  // default image shown for pending or fallback
  // imageSrc = "/cart_confirmation.png",
  // explicit image for pending state
  // imageSrcPending = "/cart_pending.png",
  // images for success and failed
  imageSrcSuccess = "/cart_success.png",
  imageSrcFailed = "/cart_failed.png",
}) {
  if (!show) return null;

  const title =
    status === "pending"
      ? "Adding to cart"
      : status === "success"
      ? "Added to cart"
      : "Failed to add";

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
              // animated image for pending
              <img
                src="/loading.png"
                alt="loading"
                className="w-16 h-16 object-contain animate-spin"
              />
            ) : (
              <img
                src={status === "success" ? imageSrcSuccess : imageSrcFailed}
                alt="cart result"
                className="w-16 h-16 object-cover rounded"
              />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="flex gap-2">
          {status === "failed" && (
            <>
              <button
                type="button"
                className="flex-1 bg-yellow-400 text-white px-4 py-2 rounded-md font-medium"
                onClick={onRetry}
              >
                Retry
              </button>
            </>
          )}

          {status === "success" && (
            <>
              <button
                type="button"
                className="flex-1 bg-pink-100 text-gray-700 px-4 py-2 rounded-md border"
                onClick={onBuyAnother}
              >
                Buy another cake
              </button>
              <button
                type="button"
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-md"
                onClick={onAddAccessories}
              >
                Add accessories
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
