import React, { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";

export default function BillingForm() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: "", mobile: "" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState({ type: "", value: 0, amount: 0, code: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [billData, setBillData] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then(res => setProducts(res.data));
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(c => c.productId === product._id);
    if (existing) {
      setCart(cart.map(c => c.productId === product._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product._id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(c => {
      if (c.productId === id) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.productId !== id));
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await axios.post("http://localhost:5000/api/coupons/validate", { code: couponCode });
      const coupon = res.data;
      let amount = 0;
      const sub = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      if (coupon.type === "percentage") {
        amount = (sub * coupon.value) / 100;
      } else {
        amount = Math.min(sub, coupon.value);
      }
      
      setDiscount({ type: coupon.type, value: coupon.value, amount, code: coupon.code });
      setMessage({ text: "Coupon applied successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Invalid coupon", type: "error" });
      setDiscount({ type: "", value: 0, amount: 0, code: "" });
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount.amount;

  const createBill = async () => {
    if (cart.length === 0) return setMessage({ text: "Cart is empty", type: "error" });
    if (!customer.name || !customer.mobile) return setMessage({ text: "Please enter customer details", type: "error" });

    try {
      const res = await axios.post("http://localhost:5000/api/bills", {
        customerName: customer.name,
        customerMobile: customer.mobile,
        products: cart.map(c => ({ productId: c.productId, quantity: c.quantity, price: c.price })),
        couponCode: discount.code,
        discountType: discount.type,
        discountValue: discount.value,
        discountAmount: discount.amount
      });
      setBillData(res.data);
      
      // Auto-send WhatsApp
      try {
        await axios.post("http://localhost:5000/api/whatsapp/send-invoice", {
          mobile: customer.mobile,
          billData: res.data
        });
        setMessage({ text: "Bill created & sent via WhatsApp!", type: "success" });
      } catch (waErr) {
        const errorMsg = waErr.response?.data?.error || waErr.message;
        setMessage({ text: `Bill created! WhatsApp failed: ${errorMsg}`, type: "success" });
      }

      setCart([]);
      setCustomer({ name: "", mobile: "" });
      setDiscount({ type: "", value: 0, amount: 0, code: "" });
      setCouponCode("");
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Error creating bill", type: "error" });
    }
  };

  const printInvoice = () => {
    if (!billData) return;
    const element = document.getElementById("invoice");
    html2pdf(element, {
      margin: 10,
      filename: `Invoice_${billData.customerMobile}_${new Date().getTime()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>New Bill</h1>
        <p>Create a new invoice for your customer</p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
          {message.text}
        </div>
      )}

      <div className="billing-layout">
        {/* Left: Customer + Products */}
        <div>
          {/* Customer Info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Customer Information</h4>
            </div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="form-label">Mobile Number</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter mobile number" 
                    value={customer.mobile} 
                    onChange={e => setCustomer({ ...customer, mobile: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="form-label">Customer Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter customer name" 
                    value={customer.name} 
                    onChange={e => setCustomer({ ...customer, name: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="card">
            <div className="card-header">
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Select Products</h4>
              <input
                className="form-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <div className="card-body">
              <div className="product-grid-buttons">
                {filteredProducts.map(p => (
                  <button 
                    key={p._id} 
                    className={`product-btn ${p.stock <= 0 ? "disabled" : ""}`}
                    onClick={() => addToCart(p)}
                  >
                    {p.name} <span className="product-price">${p.price}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-muted small">No products found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="cart-section">
          <div className="cart-header">
            🛒 Cart ({cart.length} items)
          </div>
          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 16px" }}>
                <p className="text-muted small">Add products to get started</p>
              </div>
            ) : (
              cart.map(c => (
                <div key={c.productId} className="cart-item">
                  <div>
                    <div className="cart-item-name">{c.name}</div>
                    <div className="cart-item-meta">${c.price.toFixed(2)} × {c.quantity}</div>
                  </div>
                  <div className="cart-item-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(c.productId, -1)}>−</button>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, minWidth: 24, textAlign: "center" }}>{c.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(c.productId, 1)}>+</button>
                    <button 
                      className="qty-btn" 
                      onClick={() => removeFromCart(c.productId)}
                      style={{ color: "var(--danger)", borderColor: "rgba(220,38,38,0.2)" }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon */}
          <div className="coupon-input-group">
            <input 
              className="form-input" 
              placeholder="Coupon code" 
              value={couponCode} 
              onChange={e => setCouponCode(e.target.value.toUpperCase())} 
              style={{ flex: 1, fontSize: "0.85rem" }}
            />
            <button className="btn btn-secondary btn-sm" onClick={applyCoupon}>Apply</button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount.amount > 0 && (
              <div className="summary-row discount">
                <span>Discount ({discount.code})</span>
                <span>−${discount.amount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={createBill} 
              disabled={cart.length === 0}
              style={{ width: "100%", marginTop: 16 }}
            >
              Create Bill
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      {billData && (
        <div id="invoice" className="invoice-container" style={{ marginTop: 32 }}>
          <div className="invoice-header">
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>INVOICE</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                #{billData._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h4 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Store Billing</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>123 Market Street, City</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>+1 234 567 890</p>
            </div>
          </div>

          <div className="invoice-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>BILL TO</p>
                <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{billData.customerName}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{billData.customerMobile}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>DATE</p>
                <p style={{ fontWeight: 600, margin: "4px 0 0" }}>{new Date(billData.date).toLocaleDateString()}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(billData.date).toLocaleTimeString()}</p>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "10px 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Product</th>
                  <th style={{ textAlign: "center", padding: "10px 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "10px 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "10px 0", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {billData.products.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "12px 0", fontWeight: 500 }}>{p.name}</td>
                    <td style={{ textAlign: "center", padding: "12px 0" }}>{p.quantity}</td>
                    <td style={{ textAlign: "right", padding: "12px 0" }}>${p.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", padding: "12px 0", fontWeight: 600 }}>${(p.price * p.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: 250 }}>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${billData.subtotal.toFixed(2)}</span>
                </div>
                {billData.discount?.amount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({billData.discount.couponCode})</span>
                    <span>−${billData.discount.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Amount Due</span>
                  <span>${billData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Thank you for your business!</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Please visit again.</p>
            </div>
            
            <div className="no-print" style={{ textAlign: "center", marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={printInvoice}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
