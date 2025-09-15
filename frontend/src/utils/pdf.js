// Formatted PDF generator using jsPDF. Renders a checkout-style summary.
export async function generateOrderPdf(order) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const left = 40;
    const right = 555;
    let y = 40;

    // column positions (explicit) to avoid overlap
    const xQty = right - 150; // quantity column (right-aligned)
    const xUnit = right - 90; // unit price column (right-aligned)
    const xTotal = right - 20; // total column (right-aligned)
    const titleWidth = xQty - left - 12; // width available for the item title

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Sweet Heaven", left, y);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    y += 22;
    doc.text("Order Details", left, y);

    y += 18;
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 12;

    // Unwrap server wrapper if present: some responses are { ok:true, item: { ... } }
    let src = (order && order.item) || order;
    // deeply unwrap if there are multiple wrapper layers (e.g., { item: { item: { ... } } })
    while (src && src.item) src = src.item;

    // Order meta - detect id from several possible fields and prefer orderId
    const id =
      (src &&
        (src.orderId ||
          src.id ||
          src._id ||
          src._id?._str ||
          (src._id && src._id.toString && src._id.toString()))) ||
      "-";
    doc.setFontSize(11);
    doc.text(`Order id: ${id}`, left, y);
    if (src && src.createdAt)
      doc.text(
        `Created: ${new Date(src.createdAt).toLocaleString()}`,
        right - 150,
        y
      );
    y += 18;

    // --- Use OrderView logic for extracting customer details ---
    doc.setFont("helvetica", "bold");
    doc.text("Customer", left, y);
    doc.setFont("helvetica", "normal");
    y += 14;

    // --- Use the exact logic from OrderView.jsx for extracting customer details ---
    // Prefer clientDetails, fallback to top-level fields if missing
    const details = src.clientDetails || {};

    function displayField(label, value) {
      doc.text(`${label}: ${value ?? "-"}`, left, y);
      y += 14;
    }

    displayField("Name", details.name || src.name);
    displayField("Primary phone", details.phone || src.phone);
    displayField(
      "Secondary phone",
      details.phone2 ||
        details.secondaryPhone ||
        src.phone2 ||
        src.secondaryPhone
    );
    displayField("Email", details.email || src.email);
    displayField(
      "Confirmation method",
      details.confirmationMethod || src.confirmationMethod
    );
    displayField("Scheduled Date", details.scheduledDate || src.scheduledDate);
    if (details.address || src.address) {
      const addrLines = doc.splitTextToSize(
        `Address: ${details.address || src.address}`,
        right - left
      );
      doc.text(addrLines, left, y);
      y += addrLines.length * 12 + 4;
    } else {
      displayField("Address", undefined);
    }
    displayField("Note", src.note || src.notes);

    y += 4;
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 12;

    // Items header
    doc.setFont("helvetica", "bold");
    doc.text("Item", left, y);
    doc.text("Qty", xQty, y, { align: "right" });
    doc.text("Unit", xUnit, y, { align: "right" });
    doc.text("Total", xTotal, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 14;

    // Items list
    // Items: accept src.items or src.item.items or src.items array; then sort cakes first
    const rawItems = src.items || (src.item && src.item.items) || [];
    const items = Array.isArray(rawItems)
      ? rawItems.slice().sort((a, b) => {
          const aType = (
            a.productType ||
            a.productCategory ||
            ""
          ).toLowerCase();
          const bType = (
            b.productType ||
            b.productCategory ||
            ""
          ).toLowerCase();
          // cakes first
          if (aType === bType) return 0;
          if (aType === "cake") return -1;
          if (bType === "cake") return 1;
          return 0;
        })
      : [];
    const pageHeight = 820;
    for (let it of items) {
      // resolve item title - prefer stored/display name fields when present
      let title =
        it.itemName ||
        it.name ||
        it.cakeName ||
        // if a product object is embedded, prefer its name/cakeName
        (it.product && (it.product.cakeName || it.product.name)) ||
        (it.details && (it.details.cakeName || it.details.name)) ||
        it.itemId ||
        it.productType ||
        "Item";
      // detect accessories (they don't have sizes)
      const isAccessory =
        it.productCategory === "accessory" ||
        it.productType === "accessory" ||
        String(it.id || "").startsWith("accessory:");

      // include size if present and this is not an accessory
      const sizeLabel =
        (typeof it.size === "string" ? it.size : it.size?.size) ||
        it.sizeId ||
        (typeof it.sizeIndex !== "undefined" ? `index:${it.sizeIndex}` : null);

      // toppings array
      const toppingsArr = (it.toppings || []).map((t) =>
        typeof t === "object" ? t.name || t.toppingId || t.id : String(t)
      );

      const qty = Number(it.qty || 1);
      // unit price: prefer explicit unitPrice/price. Size price is already reflected
      // in item.unitPrice/price.
      const unit = Number(it.unitPrice ?? it.price ?? 0);
      const toppingsSum = (it.toppings || []).reduce(
        (s, t) => s + Number((t && (t.price?.price ?? t.price)) || 0),
        0
      );
      const lineTotal = (unit + toppingsSum) * qty;

      // prepare title and toppings lines
      const titleLines = doc.splitTextToSize(title, titleWidth);
      const toppingsLines = toppingsArr.length
        ? doc.splitTextToSize(
            `Toppings: ${toppingsArr.join(", ")}`,
            titleWidth - 8
          )
        : [];
      const blockLines = titleLines.length + toppingsLines.length;
      const blockHeight = blockLines * 12 + 8;

      if (y + blockHeight > pageHeight) {
        doc.addPage();
        y = 40;
      }

      // draw title
      doc.text(titleLines, left, y);

      // draw toppings below the title in smaller font (avoid inline long toppings)
      if (toppingsLines.length) {
        doc.setFontSize(9);
        doc.text(toppingsLines, left + 8, y + titleLines.length * 12 + 4);
        doc.setFontSize(11);
      }

      // draw size (for cakes) and numbers aligned to the top of the block
      if (sizeLabel && !isAccessory)
        doc.text(String(sizeLabel), xUnit - 200, y);
      const topY = y + (titleLines.length - 1) * 12;
      doc.text(String(qty), xQty, topY, { align: "right" });
      doc.text(`Rs. ${Number(unit).toLocaleString("en-IN")}`, xUnit, topY, {
        align: "right",
      });
      doc.text(
        `Rs. ${Number(lineTotal).toLocaleString("en-IN")}`,
        xTotal,
        topY,
        {
          align: "right",
        }
      );

      y += blockHeight;
    }

    // Subtotal and note
    y += 6;
    doc.setLineWidth(0.5);
    doc.line(left, y, right, y);
    y += 12;
    const subtotal = Number(src.subtotal || src.item?.subtotal || 0);
    doc.setFont("helvetica", "bold");
    // place subtotal label aligned to the unit column and amount at the total column
    doc.text("Subtotal", xUnit, y, { align: "right" });
    doc.text(`Rs. ${Number(subtotal).toLocaleString("en-IN")}`, xTotal, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    y += 20;

    const theNote = src.note || src.item?.note || null;
    if (theNote) {
      const noteLines = doc.splitTextToSize(`Note: ${theNote}`, right - left);
      doc.text(noteLines, left, y);
      y += noteLines.length * 12 + 8;
    }

    // contact / confirmation method - use clientDetails first then top-level fallback
    const confirmationMethod =
      (src.clientDetails && src.clientDetails.confirmationMethod) ||
      src.confirmationMethod ||
      src.item?.confirmationMethod ||
      null;
    if (confirmationMethod) {
      doc.text(`Confirmation method: ${confirmationMethod}`, left, y);
      y += 16;
    }

    doc.save(`order-${id || Date.now()}.pdf`);
    return true;
  } catch (e) {
    console.warn(
      "Failed to generate PDF (jspdf missing?). Falling back to JSON download.",
      e
    );
    throw e;
  }
}
