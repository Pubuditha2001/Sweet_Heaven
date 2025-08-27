import React, { useEffect, useState, useRef } from "react";

export default function OrderDetailsConfirmation({
  onSubmit,
  hideSubmit = false,
  onChange,
}) {
  const computeMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [minDate] = useState(computeMinDate());
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    phone2: "",
    email: "",
    confirmationMethod: "call",
    scheduledDate: computeMinDate(),
  });

  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const dateRef = useRef(null);

  const getAvailableDates = (days = 30) => {
    const start = new Date(minDate + "T00:00:00");
    const dates = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}`;
      dates.push({ date: d, iso, label: d.toLocaleDateString() });
    }
    return dates;
  };

  useEffect(() => {
    if (form.scheduledDate < minDate) {
      setForm((f) => ({ ...f, scheduledDate: minDate }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate]);

  const validateField = (name, value) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "name") {
        if (!value || !value.trim()) next.name = "Name is required.";
        else delete next.name;
      }
      if (name === "phone") {
        if (!value || !value.trim())
          next.phone = "Primary phone (WhatsApp) is required.";
        else if (value.replace(/\D/g, "").length < 6)
          next.phone = "Enter a valid phone number.";
        else delete next.phone;
      }
      if (name === "email") {
        if (!value || !value.trim()) next.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          next.email = "Enter a valid email.";
        else delete next.email;
      }
      if (name === "scheduledDate") {
        if (!value)
          next.scheduledDate = "Please choose a delivery/pickup date.";
        else delete next.scheduledDate;
      }
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.phone.trim()) e.phone = "Primary phone (WhatsApp) is required.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 6)
      e.phone = "Enter a valid phone number.";
    if (!form.email || !form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email.";
    if (!form.scheduledDate)
      e.scheduledDate = "Please choose a delivery/pickup date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "radio" ? value : value;
    setForm((f) => ({ ...f, [name]: val }));
    validateField(name, val);
  };

  useEffect(() => {
    if (typeof onChange === "function") onChange(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setStatusMsg("");
    if (!validate()) return;
    const payload = { ...form };
    if (typeof onSubmit === "function") {
      try {
        await onSubmit(payload);
        setStatusMsg(
          "Details submitted. The admin will review and contact you."
        );
      } catch (err) {
        setStatusMsg("Failed to submit details. Please try again.");
      }
      return;
    }
    console.log("Order details (no onSubmit provided):", payload);
    setStatusMsg(
      "Details saved locally. Admin will review and contact you with confirmation and payment steps."
    );
  };

  return (
    <div className="order-details-confirmation px-2 py-2">
      <h2 className="text-lg font-semibold text-pink-600 mb-2">
        Provide your details
      </h2>

      <form onSubmit={handleSubmit} className="order-details-form space-y-3">
        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded bg-white p-2 mt-1 text-gray-800"
          />
          {errors.name && (
            <div className="text-red-600 text-sm mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Address (optional)
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded bg-white p-2 mt-1 text-gray-800"
          />
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Primary phone (WhatsApp) *
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. +1234567890"
            className="w-full border rounded bg-white p-2 mt-1 text-gray-800"
          />
          {errors.phone && (
            <div className="text-red-600 text-sm mt-1">{errors.phone}</div>
          )}
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Secondary phone
          </label>
          <input
            name="phone2"
            value={form.phone2}
            onChange={handleChange}
            placeholder="optional"
            className="w-full border rounded bg-white p-2 mt-1 text-gray-800"
          />
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            required
            className="w-full border rounded bg-white p-2 mt-1 text-gray-800"
          />
          {errors.email && (
            <div className="text-red-600 text-sm mt-1">{errors.email}</div>
          )}
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Order confirmation method
          </label>
          <div className="flex items-center gap-4 mt-1">
            <label className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="radio"
                name="confirmationMethod"
                value="call"
                checked={form.confirmationMethod === "call"}
                onChange={handleChange}
                className="h-4 w-4"
                style={{
                  appearance: "none",
                  backgroundColor: "white",
                  border: "2px solid #d1d5db",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  position: "relative",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(236, 72, 153, 0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
                ref={(el) => {
                  if (el) {
                    if (form.confirmationMethod === "call") {
                      el.style.setProperty(
                        "background-color",
                        "white",
                        "important"
                      );
                      el.style.setProperty(
                        "border-color",
                        "#ec4899",
                        "important"
                      );
                      el.style.setProperty(
                        "background-image",
                        "radial-gradient(circle, #ec4899 40%, transparent 40%)",
                        "important"
                      );
                    } else {
                      el.style.setProperty(
                        "background-color",
                        "white",
                        "important"
                      );
                      el.style.setProperty(
                        "border-color",
                        "#d1d5db",
                        "important"
                      );
                      el.style.setProperty(
                        "background-image",
                        "none",
                        "important"
                      );
                    }
                  }
                }}
              />
              Call
            </label>
            <label className="flex items-center gap-2 bg-white text-sm text-gray-800">
              <input
                type="radio"
                name="confirmationMethod"
                value="whatsapp"
                checked={form.confirmationMethod === "whatsapp"}
                onChange={handleChange}
                className="h-4 w-4"
                style={{
                  appearance: "none",
                  backgroundColor: "white",
                  border: "2px solid #d1d5db",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  position: "relative",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(236, 72, 153, 0.5)";
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = "none";
                }}
                ref={(el) => {
                  if (el) {
                    if (form.confirmationMethod === "whatsapp") {
                      el.style.setProperty(
                        "background-color",
                        "white",
                        "important"
                      );
                      el.style.setProperty(
                        "border-color",
                        "#ec4899",
                        "important"
                      );
                      el.style.setProperty(
                        "background-image",
                        "radial-gradient(circle, #ec4899 40%, transparent 40%)",
                        "important"
                      );
                    } else {
                      el.style.setProperty(
                        "background-color",
                        "white",
                        "important"
                      );
                      el.style.setProperty(
                        "border-color",
                        "#d1d5db",
                        "important"
                      );
                      el.style.setProperty(
                        "background-image",
                        "none",
                        "important"
                      );
                    }
                  }
                }}
              />
              WhatsApp message
            </label>
          </div>
        </div>

        <div>
          <label className="block p-1 text-sm font-medium text-gray-700">
            Schedule (earliest available) *
          </label>

          <div className="flex items-center gap-3">
            <input
              ref={dateRef}
              type="date"
              name="scheduledDate"
              value={form.scheduledDate}
              onChange={(e) => {
                handleChange(e);
                setShowCalendar(false);
              }}
              min={minDate}
              className="border rounded bg-white p-2 mt-1 text-gray-800"
            />

            <button
              type="button"
              onClick={() => setShowCalendar((s) => !s)}
              className="mt-1 px-3 py-2 border rounded bg-white text-sm text-gray-800"
            >
              {showCalendar ? "Hide calendar" : "Pick from calendar"}
            </button>
          </div>

          {errors.scheduledDate && (
            <div className="text-red-600 text-sm mt-1">
              {errors.scheduledDate}
            </div>
          )}

          {showCalendar && (
            <div className="mt-2 grid grid-cols-7 gap-1">
              {getAvailableDates(30).map((d) => {
                const selected = d.iso === form.scheduledDate;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, scheduledDate: d.iso }));
                      validateField("scheduledDate", d.iso);
                      setShowCalendar(false);
                    }}
                    className={`px-2 py-2 text-xs rounded ${
                      selected
                        ? "bg-pink-600 text-white"
                        : "bg-white text-gray-800 border"
                    }`}
                    aria-pressed={selected}
                  >
                    {new Date(d.iso + "T00:00:00").getDate()}
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-xs text-gray-600 mt-1">
            We require at least 2 days for order preparation. Earliest available
            date shown above.
          </div>
        </div>

        {!hideSubmit && (
          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Submit details
            </button>
          </div>
        )}

        {statusMsg && (
          <div className="text-sm text-gray-700 mt-2">{statusMsg}</div>
        )}
      </form>

      <section className="order-process-instructions mt-3 text-sm text-gray-700">
        <h3 className="font-medium">How your order is processed</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>
            You provide the details and preferred confirmation method above, and
            choose a scheduled date (minimum 2 days for preparation).
          </li>
          <li>
            After you submit, the admin will review your order and the requested
            date/availability.
          </li>
          <li>
            The admin will then inform you whether the order is confirmed or
            rejected. This message will include next steps and any payment
            instructions. You will be contacted via the method you selected
            (WhatsApp message or a phone call).
          </li>
          <li>
            If confirmed, the admin will share payment details (or arrange
            payment on delivery/pickup) and any additional instructions about
            pickup/delivery timings.
          </li>
          <li>
            If rejected, the admin will explain the reason and possible
            alternatives (reschedule, modify items, or refund if already paid).
          </li>
        </ol>
        <p className="note mt-2">
          <strong>Note:</strong> We prioritize orders in the order received.
          Choosing WhatsApp as confirmation method often gives fastest replies.
        </p>
      </section>
    </div>
  );
}
