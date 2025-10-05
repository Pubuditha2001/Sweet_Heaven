import React, { useEffect } from "react";
import { normalizeImageUrl } from "../../utils/imageUtils";

export default function FeedbackModal({
  show,
  type = "success", // "success", "error", "info", "warning"
  title,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}) {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  if (!show) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50",
          iconColor: "bg-green-500",
          titleColor: "text-green-900",
          messageColor: "text-green-700",
          buttonColor: "bg-green-500 hover:bg-green-600",
          icon: normalizeImageUrl("/confirmed.png"), // Success icon
        };
      case "error":
        return {
          bgColor: "bg-red-50",
          iconColor: "bg-red-500",
          titleColor: "text-red-900",
          messageColor: "text-red-700",
          buttonColor: "bg-red-500 hover:bg-red-600",
          icon: normalizeImageUrl("/failed.png"), // Error icon
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          iconColor: "bg-yellow-500",
          titleColor: "text-yellow-900",
          messageColor: "text-yellow-700",
          buttonColor: "bg-yellow-500 hover:bg-yellow-600",
          icon: normalizeImageUrl("/idea.png"), // Warning icon
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-50",
          iconColor: "bg-blue-500",
          titleColor: "text-blue-900",
          messageColor: "text-blue-700",
          buttonColor: "bg-blue-500 hover:bg-blue-600",
          icon: normalizeImageUrl("/idea.png"), // Info icon
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div
        className={`relative ${styles.bgColor} rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto border-4 border-white`}
      >
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
          <div
            className={`w-32 h-32 rounded-full ${styles.bgColor} flex items-center justify-center shadow-lg border-4 border-white`}
          >
            <div
              className={`w-20 h-20 rounded-full ${styles.iconColor} flex items-center justify-center`}
            >
              <img
                src={styles.icon}
                alt={type}
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </div>
        <h3
          className={`text-lg font-semibold mt-5 mb-2 text-center ${styles.titleColor}`}
        >
          {title}
        </h3>
        <p className={`text-sm mb-4 ${styles.messageColor}`}>{message}</p>
        <div className="flex justify-center">
          <button
            type="button"
            className={`${styles.buttonColor} text-white px-6 py-2 rounded-full font-medium transition-colors focus:outline-none`}
            onClick={onClose}
          >
            OK
          </button>
        </div>
        {autoClose && (
          <div className="mt-3">
            <div className={`text-xs ${styles.messageColor} opacity-70`}>
              Auto-closing in {autoCloseDelay / 1000} seconds...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
