import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ProductList({ onEdit, refreshTrigger }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/products?search=${search}&category=${category}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, category, refreshTrigger]);
  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert("Error deleting product");
      }
    }
  };

  const handleAddStock = async (id) => {
    const qty = prompt("Enter quantity to add:");
    if (qty && !isNaN(qty)) {
      try {
        await axios.patch(`http://localhost:5000/api/products/${id}/stock`, { quantity: Number(qty) });
        fetchProducts();
      } catch (err) {
        alert("Error updating stock");
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 style={{ margin: 0, fontSize: "0.95rem" }}>📦 Inventory Overview</h4>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <input 
            type="text"
            placeholder="Search products..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: "200px" }}
          />
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        {loading && products.length === 0 ? (
          <div className="spinner" />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">No products found in inventory</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  {isAdmin && <th>Cost</th>}
                  <th>Stock Status</th>
                  {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLowStock = p.stock <= (p.lowStockThreshold || 10);
                  const isOutOfStock = p.stock === 0;
                  return (
                    <tr key={p._id} className={isLowStock ? "table-danger-custom" : ""}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {isOutOfStock ? (
                          <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>OUT OF STOCK</span>
                        ) : isLowStock ? (
                          <span className="badge bg-warning" style={{ fontSize: "0.65rem" }}>LOW STOCK</span>
                        ) : null}
                      </td>
                      <td>
                        <span className="badge bg-secondary" style={{ background: "var(--bg-body)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                          {p.category || "General"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                      {isAdmin && <td className="text-muted">${(p.costPrice || 0).toFixed(2)}</td>}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: isLowStock ? "var(--danger)" : "var(--success)" 
                          }}>
                            {p.stock}
                          </span>
                          <div style={{ 
                            width: "60px", 
                            height: "6px", 
                            background: "var(--bg-body)", 
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}>
                            <div style={{ 
                              width: `${Math.min(100, (p.stock / (p.lowStockThreshold * 3)) * 100)}%`, 
                              height: "100%", 
                              background: isLowStock ? "var(--danger)" : "var(--success)" 
                            }} />
                          </div>
                        </div>
                      </td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button 
                              className="btn btn-outline-info btn-sm" 
                              onClick={() => onEdit(p)}
                              title="Edit Product"
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-success btn-sm" 
                              onClick={() => handleAddStock(p._id)}
                              title="Add Stock"
                            >
                              + Stock
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm" 
                              onClick={() => handleDelete(p._id)}
                              title="Delete Product"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
