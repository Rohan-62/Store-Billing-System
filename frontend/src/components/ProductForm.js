import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ editProduct, onComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: 10
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        category: editProduct.category || "",
        price: editProduct.price,
        costPrice: editProduct.costPrice || 0,
        stock: editProduct.stock,
        lowStockThreshold: editProduct.lowStockThreshold || 10
      });
    } else {
      setFormData({ name: "", category: "", price: "", costPrice: "", stock: "", lowStockThreshold: 10 });
    }
  }, [editProduct]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      if (editProduct) {
        await axios.put(`http://localhost:5000/api/products/${editProduct._id}`, formData);
        setMessage({ text: "Product updated successfully!", type: "success" });
      } else {
        await axios.post("http://localhost:5000/api/products", formData);
        setMessage({ text: "Product added successfully!", type: "success" });
      }
      if (onComplete) onComplete();
      if (!editProduct) setFormData({ name: "", category: "", price: "", costPrice: "", stock: "", lowStockThreshold: 10 });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Error processing product", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 style={{ margin: 0, fontSize: "0.95rem" }}>
          {editProduct ? "🛠️ Edit Product" : "➕ Add New Product"}
        </h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label className="form-label">Product Name</label>
              <input 
                className="form-input" 
                name="name" 
                placeholder="e.g. Wireless Mouse" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <input 
                className="form-input" 
                name="category" 
                placeholder="e.g. Electronics" 
                value={formData.category} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label className="form-label">Selling Price ($)</label>
              <input 
                className="form-input" 
                type="number" 
                name="price" 
                placeholder="0.00" 
                value={formData.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="form-label">Cost Price ($)</label>
              <input 
                className="form-input" 
                type="number" 
                name="costPrice" 
                placeholder="0.00" 
                value={formData.costPrice} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="form-label">Initial Stock</label>
              <input 
                className="form-input" 
                type="number" 
                name="stock" 
                placeholder="0" 
                value={formData.stock} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="form-label">Low Stock Alert</label>
              <input 
                className="form-input" 
                type="number" 
                name="lowStockThreshold" 
                placeholder="10" 
                value={formData.lowStockThreshold} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : (editProduct ? "Update Product" : "Save Product")}
            </button>
            {editProduct && (
              <button className="btn btn-outline-secondary" type="button" onClick={onComplete}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} style={{ marginTop: "16px", marginBottom: 0 }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
