import React, { useState, useEffect } from "react";
import axios from "axios";

export default function WhatsAppStatus() {
  const [data, setData] = useState({ status: "LOADING", qrCode: null });

  const fetchStatus = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/whatsapp/status");
      setData(res.data);
    } catch (err) {
      // Silently handle — WhatsApp may not always be needed
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000);
    fetchStatus();
    return () => clearInterval(interval);
  }, []);

  // Don't show banner if connected (clean UI)
  if (data.status === "CONNECTED") {
    return (
      <div className="whatsapp-banner">
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>WhatsApp</span>
        <span className="wa-status-dot connected" style={{ color: "var(--success)" }}>
          Connected — invoices will be sent automatically
        </span>
      </div>
    );
  }

  if (data.status === "QR_READY" && data.qrCode) {
    return (
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ textAlign: "center" }}>
          <h4 style={{ fontSize: "0.95rem" }}>Connect WhatsApp</h4>
          <p className="text-muted small" style={{ marginBottom: 12 }}>
            Scan this QR code with your phone's WhatsApp
          </p>
          <div style={{ 
            display: "inline-block", padding: 16, background: "white", 
            borderRadius: 12, border: "1px solid var(--border)" 
          }}>
            <img src={data.qrCode} alt="WhatsApp QR" style={{ width: 180 }} />
          </div>
          <p className="text-muted small" style={{ marginTop: 12 }}>
            QR code refreshes automatically
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-banner">
      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>WhatsApp</span>
      <span className="wa-status-dot disconnected" style={{ color: "var(--text-muted)" }}>
        {data.status === "LOADING" ? "Initializing..." : "Not connected"}
      </span>
    </div>
  );
}
