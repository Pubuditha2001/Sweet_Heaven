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

    // Order meta - detect id from several possible fields and make it more visible
    const id =
      (order &&
        (order.id ||
          order._id ||
          order.orderId ||
          order._id?._str ||
          order._id?.toString())) ||
      "-";
    doc.setFontSize(11);
    doc.text(`Order id: ${id}`, left, y);
    if (order.createdAt)
      doc.text(
        `Created: ${new Date(order.createdAt).toLocaleString()}`,
        right - 150,
        y
      );
    y += 18;

    // Client details
    doc.setFont("helvetica", "bold");
    doc.text("Customer", left, y);
    doc.setFont("helvetica", "normal");
    y += 14;
    const client = order.clientDetails || {};
    if (client.name) {
      doc.text(`Name: ${client.name}`, left, y);
      y += 14;
    }
    if (client.phone) {
      doc.text(`Phone: ${client.phone}`, left, y);
      y += 14;
    }
    const secondaryPhone =
      client.phone2 ||
      client.phone_2 ||
      client.secondaryPhone ||
      client.secondary_phone ||
      client.secondary ||
      client.secondaryPhoneNumber ||
      client.secondaryPhoneNumber ||
      null;
    // always show secondary phone; display 'None' when empty
    const secondaryPhoneDisplay = secondaryPhone
      ? String(secondaryPhone)
      : "None";
    doc.text(`Secondary phone: ${secondaryPhoneDisplay}`, left, y);
    y += 14;
    if (client.email) {
      doc.text(`Email: ${client.email}`, left, y);
      y += 14;
    }
    if (client.scheduledDate) {
      doc.text(`Scheduled: ${client.scheduledDate}`, left, y);
      y += 14;
    }
    if (client.address) {
      const addrLines = doc.splitTextToSize(
        `Address: ${client.address}`,
        right - left
      );
      doc.text(addrLines, left, y);
      y += addrLines.length * 12 + 4;
    }

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
    const items = order.items || [];
    const pageHeight = 820;
    for (let it of items) {
      // resolve item title
      let title =
        it.name ||
        it.cakeName ||
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
    const subtotal = Number(order.subtotal || 0);
    doc.setFont("helvetica", "bold");
    // place subtotal label aligned to the unit column and amount at the total column
    doc.text("Subtotal", xUnit, y, { align: "right" });
    doc.text(`Rs. ${Number(subtotal).toLocaleString("en-IN")}`, xTotal, y, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");
    y += 20;

    if (order.note) {
      const noteLines = doc.splitTextToSize(
        `Note: ${order.note}`,
        right - left
      );
      doc.text(noteLines, left, y);
      y += noteLines.length * 12 + 8;
    }

    // contact method
    if (order.clientDetails && order.clientDetails.confirmationMethod) {
      doc.text(
        `Confirmation method: ${order.clientDetails.confirmationMethod}`,
        left,
        y
      );
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
