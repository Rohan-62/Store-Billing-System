import React, { useEffect, useState } from "react";
import axios from "axios";

export default function BillHistory() {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filters, setFilters] = useState({ mobile: "", startDate: "", endDate: "" });
  const [expandedBill, setExpandedBill] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBills = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filters.mobile) params.append("mobile", filters.mobile);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await axios.get(`http://localhost:5000/api/bills?${params}`);
      setBills(res.data.bills || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, totalCount: 0 });
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBills(); }, []);

  const handleSearch = () => {
    fetchBills(1);
  };

  const clearFilters = () => {
    setFilters({ mobile: "", startDate: "", endDate: "" });
    setTimeout(() => fetchBills(1), 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Bill History</h1>
        <p>View and search all transactions</p>
      </div>

      {/* Revenue Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-primary">
          <div className="stat-label">Filtered Revenue</div>
          <div className="stat-value">${totalRevenue.toFixed(2)}</div>
          <div className="stat-sub">{pagination.totalCount} bills found</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by mobile..."
              value={filters.mobile}
              onChange={e => setFilters({ ...filters, mobile: e.target.value })}
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="spinner" />
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📜</div>
              <p className="empty-state-text">No bills found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Items</th>
                      <th>Discount</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <React.Fragment key={bill._id}>
                        <tr 
                          className="expandable-row"
                          onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ fontWeight: 600, color: "var(--primary)" }}>
                            #{bill._id.slice(-6).toUpperCase()}
                          </td>
                          <td style={{ fontWeight: 500 }}>{bill.customerName}</td>
                          <td style={{ color: "var(--text-muted)" }}>{bill.customerMobile}</td>
                          <td>{bill.products?.length || 0} items</td>
                          <td>
                            {bill.discount?.amount > 0 ? (
                              <span className="badge bg-success">
                                -${bill.discount.amount.toFixed(2)}
                              </span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>—</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 700 }}>${bill.total.toFixed(2)}</td>
                          <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {new Date(bill.date).toLocaleDateString()}<br/>
                            {new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                        {expandedBill === bill._id && (
                          <tr>
                            <td colSpan="7" style={{ padding: 0 }}>
                              <div className="expanded-detail">
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                  <div>
                                    <h4 style={{ fontSize: "0.85rem", marginBottom: 8 }}>Products</h4>
                                    <ul>
                                      {bill.products?.map((p, i) => (
                                        <li key={i}>
                                          <strong>{p.name}</strong> × {p.quantity} — ${(p.price * p.quantity).toFixed(2)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 style={{ fontSize: "0.85rem", marginBottom: 8 }}>Summary</h4>
                                    <div className="summary-row">
                                      <span>Subtotal</span>
                                      <span>${bill.subtotal?.toFixed(2)}</span>
                                    </div>
                                    {bill.discount?.amount > 0 && (
                                      <div className="summary-row discount">
                                        <span>Discount ({bill.discount.couponCode})</span>
                                        <span>-${bill.discount.amount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    <div className="summary-row total">
                                      <span>Total Paid</span>
                                      <span>${bill.total.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination-bar" style={{ padding: "12px 20px" }}>
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} bills)
                </span>
                <div className="pagination-buttons">
                  <button
                    className="page-btn"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchBills(pagination.page - 1)}
                  >
                    ← Previous
                  </button>
                  <button
                    className="page-btn"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchBills(pagination.page + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
