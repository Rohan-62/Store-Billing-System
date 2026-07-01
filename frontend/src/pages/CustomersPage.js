import React, { useState, useEffect } from "react";
import axios from "axios";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billsLoading, setBillsLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/customers?mobile=${search}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const viewBills = async (customer) => {
    setBillsLoading(true);
    setSelectedCustomer(customer);
    try {
      const res = await axios.get(`http://localhost:5000/api/customers/${customer._id}/bills`);
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching customer bills:", err);
    }
    setBillsLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <p>Manage customer relationships and purchase history</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h4 style={{ margin: 0, fontSize: "0.95rem" }}>👥 Customer List</h4>
          <input 
            className="form-input" 
            placeholder="Search by mobile number..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: "240px" }}
          />
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {loading && customers.length === 0 ? (
            <div className="spinner" />
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-text">No customers found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Mobile Number</th>
                    <th>Member Since</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{c.mobile}</td>
                      <td style={{ color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          className="btn btn-outline-primary btn-sm" 
                          onClick={() => viewBills(c)}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <div className="card" style={{ marginTop: "24px" }}>
          <div className="card-header" style={{ background: "var(--primary-50)", borderBottom: "1px solid var(--primary-light)" }}>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--primary)" }}>
                Transaction History for {selectedCustomer.name}
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Mobile: {selectedCustomer.mobile}
              </p>
            </div>
            <button className="btn btn-link" onClick={() => setSelectedCustomer(null)} style={{ color: "var(--text-muted)" }}>
              Close ×
            </button>
          </div>
          <div className="card-body">
            {billsLoading ? (
              <div className="spinner" />
            ) : bills.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <p className="text-muted small">No purchase history found for this customer.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {bills.map(bill => (
                  <div key={bill._id} className="card" style={{ background: "var(--bg-body)", boxShadow: "none" }}>
                    <div className="card-body" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>${bill.total.toFixed(2)}</div>
                          <div className="small text-muted">{new Date(bill.date).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="badge bg-primary" style={{ marginBottom: "4px" }}>
                            #{bill._id.slice(-6).toUpperCase()}
                          </span>
                          <div className="small text-muted">{bill.products.length} Items</div>
                        </div>
                      </div>
                      
                      <div style={{ padding: "10px", background: "white", borderRadius: "6px", border: "1px solid var(--border)" }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {bill.products.map((p, i) => (
                            <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "4px 0" }}>
                              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{p.name} × {p.quantity}</span>
                              <span style={{ color: "var(--text-secondary)" }}>${(p.price * p.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        {bill.discount?.amount > 0 && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "4px 0", marginTop: "4px", borderTop: "1px dashed var(--border)", color: "var(--success)", fontWeight: 600 }}>
                            <span>Discount ({bill.discount.couponCode})</span>
                            <span>−${bill.discount.amount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
