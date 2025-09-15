export default function AccessoryAddPopup({
  show,
  status = "pending", // 'pending' | 'success' | 'failed'
  message = "",
  onClose,
  onGoToCart,
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
              <img
                src="/loading.png"
                alt="loading"
                className="w-16 h-16 object-contain animate-spin"
              />
            ) : (
              <img
                src={status === "success" ? imageSrcSuccess : imageSrcFailed}
                alt="result"
                className="w-16 h-16 object-cover rounded"
              />
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            className="px-6 py-2 bg-pink-500 text-white rounded-md font-medium"
            onClick={onClose}
          >
            OK
          </button>
          {status === "success" && (
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 border border-gray-200 text-gray-800 rounded-md font-medium"
              onClick={onGoToCart}
            >
              Go to cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
