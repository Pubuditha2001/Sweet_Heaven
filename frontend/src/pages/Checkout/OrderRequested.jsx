import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateOrderPdf } from "../../utils/pdf";

export default function OrderRequested() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, contactMethod, order } = location.state || {};

  const download = async () => {
    try {
      // ensure the PDF receives the authoritative order id returned by the server
      const pdfOrder = order
        ? { ...order, id, contactMethod }
        : { id, contactMethod };
      await generateOrderPdf(pdfOrder);
    } catch (e) {
      console.error(e);
      // fallback: download JSON
      const blob = new Blob(
        [
          JSON.stringify(
            order ? { ...order, id, contactMethod } : { id, contactMethod },
            null,
            2
          ),
        ],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${id || Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-pink-600 mb-4">
          Order requested
        </h1>
        <p className="mb-3 text-gray-600">
          Your order has been requested successfully.
        </p>
        {contactMethod && (
          <p className="mb-3 text-gray-600">
            Sweet Heaven will contact you via {contactMethod}.
          </p>
        )}
        {id && <p className="text-sm text-gray-600 mb-4">Order id: {id}</p>}

        <div className="flex gap-3 justify-center">
          <button
            onClick={download}
            className="px-4 py-2 bg-pink-600 text-white rounded"
          >
            Download order (PDF)
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-green-500 border rounded"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
