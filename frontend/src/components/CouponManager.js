import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    expiresAt: "",
    active: true
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.post("http://localhost:5000/api/coupons", formData);
      setMessage({ text: "Coupon created successfully!", type: "success" });
      setFormData({ code: "", type: "percentage", value: "", expiresAt: "", active: true });
      fetchCoupons();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Error creating coupon", type: "error" });
    }
    setLoading(false);
  };

  const deactivateCoupon = async (id) => {
    if (window.confirm(`Are you sure you want to deactivate this coupon?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/coupons/${id}`);
        fetchCoupons();
      } catch (err) {
        alert("Error deactivating coupon");
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Coupons</h1>
        <p>Manage discount codes and promotions</p>
      </div>

      <div className="billing-layout" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
        {/* Create Form */}
        <div className="card">
          <div className="card-header">
            <h4 style={{ margin: 0, fontSize: "0.95rem" }}>➕ Create New Coupon</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Coupon Code</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. SAVE20" 
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                  required 
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Discount Type</label>
                <select 
                  className="form-input" 
                  value={formData.type} 
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ($)</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Value</label>
                <input 
                  className="form-input" 
                  type="number" 
                  placeholder="0" 
                  value={formData.value} 
                  onChange={e => setFormData({ ...formData, value: e.target.value })} 
                  required 
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label">Expiry Date</label>
                <input 
                  className="form-input" 
                  type="date" 
                  value={formData.expiresAt} 
                  onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} 
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Creating..." : "Create Coupon"}
              </button>
            </form>
            {message.text && (
              <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} style={{ marginTop: "16px", marginBottom: 0 }}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Coupon List */}
        <div className="card">
          <div className="card-header">
            <h4 style={{ margin: 0, fontSize: "0.95rem" }}>🏷️ Active Coupons</h4>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {coupons.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏷️</div>
                <p className="empty-state-text">No coupons found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Detail</th>
                      <th>Status</th>
                      <th>Expires</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c._id}>
                        <td><span className="badge bg-primary" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>{c.code}</span></td>
                        <td style={{ fontWeight: 600 }}>
                          {c.type === "percentage" ? `${c.value}% OFF` : `$${c.value} OFF`}
                        </td>
                        <td>
                          <span className={`badge ${c.active ? "bg-success" : "bg-secondary"}`}>
                            {c.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {c.active && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deactivateCoupon(c._id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
