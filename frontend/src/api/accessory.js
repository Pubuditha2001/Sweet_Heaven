// Helper for accessory related API calls
export async function fetchAccessories() {
	const res = await fetch('/api/accessories');
	if (!res.ok) {
		// Return empty array on failure to keep callers simple
		return [];
	}
	return res.json();
}
