// Cake related API helpers
export async function fetchCakes() {
	const res = await fetch('/api/cakes');
	if (!res.ok) throw new Error('Failed to fetch cakes');
	return res.json();
}

export async function fetchCakeById(id) {
	const res = await fetch(`/api/cakes/${id}`);
	if (!res.ok) throw new Error('Product not found');
	return res.json();
}
