// Helper for accessory related API calls
export async function fetchAccessories() {
  const res = await fetch("/api/accessories");
  if (!res.ok) {
    // Return empty array on failure to keep callers simple
    return [];
  }
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
