import React, { useState, useEffect } from "react";
import { fetchAccessories, deleteAccessory } from "../../../api/accessory";
import { useNavigate } from "react-router-dom";
import { fetchAllToppings } from "../../../api/topping";

export default function AccessoriesTable() {
	const [accessories, setAccessories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [toppingFilter, setToppingFilter] = useState("");
	const [toppings, setToppings] = useState([]);
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [removeTarget, setRemoveTarget] = useState(null);
	const [modalDeleting, setModalDeleting] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		async function loadAccessoriesAndToppings() {
			setLoading(true);
			setError("");
			try {
				const allToppingsDoc = await fetchAllToppings();
				let allToppings = [];
				if (Array.isArray(allToppingsDoc)) {
					allToppings = allToppingsDoc
						.map((t) => {
							if (!t) return null;
							if (t.collectionName)
								return {
									id: t.id || t._id || (t._id ? t._id.toString() : undefined),
									collectionName: t.collectionName,
								};
							return {
								id: t.id || t._id,
								collectionName: t.name || t.collectionName,
							};
						})
						.filter(Boolean);
				} else if (allToppingsDoc && Array.isArray(allToppingsDoc.toppings)) {
					allToppings = allToppingsDoc.toppings
						.map((t) => ({
							id: t.id || t._id,
							collectionName: t.collectionName || t.name,
						}))
						.filter(Boolean);
				}
				setToppings(allToppings);

				const accessoriesData = await fetchAccessories();
				setAccessories(accessoriesData);
			} catch (err) {
				setError(err.message);
			}
			setLoading(false);
		}
		loadAccessoriesAndToppings();
	}, []);

	const filteredAccessories = accessories.filter((item) => {
		if (filter && !item.name.toLowerCase().includes(filter.toLowerCase())) return false;
		if (categoryFilter && item.category !== categoryFilter) return false;
		if (toppingFilter && item.toppingType !== toppingFilter) return false;
		return true;
	});

	const handleEdit = (item) => {
		navigate(`/admin/accessories/edit/${item._id}`);
	};

	const handleRemove = (item) => {
		setRemoveTarget(item);
		setShowRemoveModal(true);
	};

	const confirmRemove = async () => {
		if (!removeTarget) return;
		setModalDeleting(true);
		try {
			await deleteAccessory(removeTarget._id);
			setAccessories((prev) => prev.filter((c) => c._id !== removeTarget._id));
			setShowRemoveModal(false);
			setRemoveTarget(null);
		} catch (err) {
			alert("Failed to delete accessory: " + (err.message || err));
		}
		setModalDeleting(false);
	};

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-6 text-center">
				All Accessories
			</h2>
			<div className="flex justify-between items-center mb-4">
				<button
					className="bg-pink-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-pink-700 transition-colors focus:outline-none"
					onClick={() => navigate("/admin/accessories/new")}
					style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
				>
					Add Accessory
				</button>
			</div>
			<div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-between items-center mb-4">
				<input
					type="text"
					placeholder="Search by name..."
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
					className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
				/>
				<select
					value={categoryFilter}
					onChange={(e) => setCategoryFilter(e.target.value)}
					className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
				>
					<option value="">All Categories</option>
					{[...new Set(accessories.map((c) => c.category))].map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
				<select
					value={toppingFilter}
					onChange={(e) => setToppingFilter(e.target.value)}
					className="border border-pink-300 bg-white rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:border-pink-600"
				>
					<option value="">All Topping Types</option>
					{toppings.map((t) => (
						<option key={t.id} value={t.collectionName}>
							{t.collectionName}
						</option>
					))}
				</select>
			</div>
			{loading ? (
				<div className="text-gray-500">Loading accessories...</div>
			) : error ? (
				<div className="text-red-500">{error}</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white rounded-xl shadow-md">
						<thead>
							<tr className="bg-pink-50">
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Name</th>
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Description</th>
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Category</th>
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Price</th>
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Topping Type</th>
								<th className="px-4 py-2 text-left text-pink-600 font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody className="text-gray-600">
							{filteredAccessories.map((item) => (
								<tr key={item._id} className="border-b last:border-b-0">
									<td className="px-4 py-2">{item.name}</td>
									<td className="px-4 py-2">{item.description}</td>
									<td className="px-4 py-2">{item.category}</td>
									<td className="px-4 py-2">{item.price}</td>
									<td className="px-4 py-2">{item.toppingType || "-"}</td>
									<td className="px-4 py-2">
										<div className="flex flex-row gap-2 items-center">
											<button
												className="bg-green-400 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-pink-600 transition-colors focus:outline-none"
												onClick={() => handleEdit(item)}
												style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.10)" }}
											>
												Edit
											</button>
											<button
												className="bg-red-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:bg-gray-200 transition-colors focus:outline-none"
												onClick={() => handleRemove(item)}
												style={{ boxShadow: "0 2px 8px rgba(233, 30, 99, 0.07)" }}
											>
												Remove
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{showRemoveModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black opacity-40"
						onClick={() => setShowRemoveModal(false)}
					/>
					<div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 pt-12 z-10 text-center mx-auto">
						<div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-25">
							<div className="w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center shadow-lg border-4 border-white">
								<img src="/idea.png" alt="Remove" className="w-16 h-16" />
							</div>
						</div>
						<h3 className="text-lg font-semibold mt-5 mb-2 text-center text-gray-900">
							Confirm removal
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							This will permanently delete the accessory {removeTarget ? removeTarget.name : ""}. Are you sure?
						</p>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								disabled={modalDeleting}
								className="bg-red-400 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
								onClick={confirmRemove}
							>
								{modalDeleting ? "Deleting..." : "Yes, delete"}
							</button>
							<button
								type="button"
								className="bg-green-400 text-white px-4 py-2 rounded-md"
								onClick={() => setShowRemoveModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
