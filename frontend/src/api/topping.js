// Topping related API helpers
export async function fetchToppingsByRef(ref) {
	const res = await fetch(`/api/toppings/${ref}`);
	if (!res.ok) {
		return { toppings: [] };
	}
	return res.json();
}
