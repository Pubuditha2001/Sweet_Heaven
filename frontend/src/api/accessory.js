// Helper for accessory related API calls
export async function fetchAccessories() {
  const res = await fetch("/api/accessories");
  if (!res.ok) {
    // Return empty array on failure to keep callers simple
    return [];
  }
  return res.json();
}

export async function fetchHiddenAccessories() {
  const res = await fetch("/api/accessories/hidden/all");
  if (!res.ok) throw new Error("Failed to fetch hidden accessories");
  return res.json();
}

const _missingAccessoryIds = new Set();

export async function fetchAccessoryById(id) {
  if (!id) return null;
  if (_missingAccessoryIds.has(String(id))) return null;

  const res = await fetch(`/api/accessories/${id}`);
  if (!res.ok) {
    _missingAccessoryIds.add(String(id));
    return null;
  }
  return res.json();
}

export async function createAccessory(accessoryData) {
  const res = await fetch("/api/accessories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(accessoryData),
  });
  if (!res.ok) {
    throw new Error(`Failed to create accessory: ${res.statusText}`);
  }
  return res.json();
}

export async function updateAccessory(id, accessoryData) {
  const res = await fetch(`/api/accessories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(accessoryData),
  });
  if (!res.ok) {
    throw new Error(`Failed to update accessory: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteAccessory(id) {
  const res = await fetch(`/api/accessories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete accessory: ${res.statusText}`);
  }
  return res.json();
}

export async function hideAccessory(id, isHidden = true) {
  const res = await fetch(`/api/accessories/${id}/hide`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHidden }),
  });
  if (!res.ok) throw new Error("Failed to hide/unhide accessory");
  return res.json();
}
