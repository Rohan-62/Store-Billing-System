import React, { useState } from "react";
import axios from "axios";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("query");
  
  // Query assistant state
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  
  // Trend analysis state
  const [trendDays, setTrendDays] = useState(30);
  const [trendResult, setTrendResult] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  
  // Recommendations state
  const [recResult, setRecResult] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const handleQuery = async () => {
    if (!question.trim()) return;
    const userQ = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: userQ }]);
    setQueryLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5000/api/ai/query", { question: userQ });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Error: ${err.response?.data?.error || "Failed to get response. Make sure GEMINI_API_KEY is set in .env"}`
      }]);
    }
    setQueryLoading(false);
  };

  const analyzeTrends = async () => {
    setTrendLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/trends", { days: trendDays });
      setTrendResult(res.data);
    } catch (err) {
      setTrendResult({ analysis: `Error: ${err.response?.data?.error || "Failed to analyze trends. Make sure GEMINI_API_KEY is set in .env"}` });
    }
    setTrendLoading(false);
  };

  const getRecommendations = async () => {
    setRecLoading(true);
    try {
      // Get product IDs from recent bills
      const billsRes = await axios.get("http://localhost:5000/api/bills?limit=5");
      const bills = billsRes.data.bills || billsRes.data;
      const productIds = [];
      (Array.isArray(bills) ? bills : []).forEach(b => {
        b.products?.forEach(p => {
          if (p.productId && !productIds.includes(p.productId)) {
            productIds.push(p.productId);
          }
        });
      });

      if (productIds.length === 0) {
        setRecResult({ recommendations: "No recent billing data to generate recommendations from. Create some bills first!" });
        setRecLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:5000/api/ai/recommendations", { 
        productIds: productIds.slice(0, 5) 
      });
      setRecResult(res.data);
    } catch (err) {
      setRecResult({ 
        recommendations: `Error: ${err.response?.data?.error || "Failed to get recommendations. Make sure GEMINI_API_KEY is set in .env"}` 
      });
    }
    setRecLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Assistant</h1>
        <p>Powered by Gemini — intelligent insights for your business</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "query" ? "active" : ""}`} 
          onClick={() => setActiveTab("query")}
        >
          💬 Query Assistant
        </button>
        <button 
          className={`tab ${activeTab === "trends" ? "active" : ""}`} 
          onClick={() => setActiveTab("trends")}
        >
          📈 Trend Analysis
        </button>
        <button 
          className={`tab ${activeTab === "recommendations" ? "active" : ""}`} 
          onClick={() => setActiveTab("recommendations")}
        >
          💡 Recommendations
        </button>
      </div>

      {/* Query Assistant Tab */}
      {activeTab === "query" && (
        <div className="card">
          <div className="ai-chat">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🤖</div>
                <p className="empty-state-text">Ask anything about your store data</p>
                <p className="text-muted small" style={{ marginTop: 8 }}>
                  Try: "What was today's revenue?" or "Which products are running low?"
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ${m.role}`}>
                {m.content}
              </div>
            ))}
            {queryLoading && (
              <div className="ai-message assistant" style={{ opacity: 0.6 }}>
                Thinking...
              </div>
            )}
          </div>
          <div className="ai-input-bar">
            <input
              className="form-control"
              placeholder="Ask a question about your store..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleQuery()}
              disabled={queryLoading}
              style={{ flex: 1 }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleQuery}
              disabled={queryLoading || !question.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Trend Analysis Tab */}
      {activeTab === "trends" && (
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>
                Analyze last
              </label>
              <select 
                className="form-control"
                value={trendDays} 
                onChange={e => setTrendDays(Number(e.target.value))}
                style={{ width: 120 }}
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
              <button 
                className="btn btn-primary" 
                onClick={analyzeTrends}
                disabled={trendLoading}
              >
                {trendLoading ? "Analyzing..." : "Analyze Trends"}
              </button>
            </div>

            {trendResult && (
              <div style={{ marginTop: 16 }}>
                {trendResult.rawData && (
                  <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card stat-primary">
                      <div className="stat-label">Total Bills</div>
                      <div className="stat-value">{trendResult.rawData.totalBills}</div>
                    </div>
                    <div className="stat-card stat-success">
                      <div className="stat-label">Total Revenue</div>
                      <div className="stat-value">${trendResult.rawData.totalRevenue.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <div className="ai-message assistant">
                  {trendResult.analysis}
                </div>
              </div>
            )}

            {!trendResult && !trendLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <p className="empty-state-text">Select a time range and click Analyze</p>
                <p className="text-muted small" style={{ marginTop: 8 }}>
                  AI will analyze your sales data and provide actionable insights
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="card">
          <div className="card-body">
            <div style={{ marginBottom: 24 }}>
              <button 
                className="btn btn-primary"
                onClick={getRecommendations}
                disabled={recLoading}
              >
                {recLoading ? "Generating..." : "Generate Recommendations"}
              </button>
              <p className="text-muted small" style={{ marginTop: 8 }}>
                AI analyzes your recent sales to suggest product bundling and cross-sell opportunities
              </p>
            </div>

            {recResult && (
              <div>
                <div className="ai-message assistant">
                  {recResult.recommendations}
                </div>
                {recResult.coPurchasedData && recResult.coPurchasedData.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h4 style={{ fontSize: "0.9rem" }}>Frequently Co-Purchased Products</h4>
                    <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                      {recResult.coPurchasedData.map((item, i) => (
                        <li key={i} className="text-secondary small" style={{ padding: "4px 0" }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!recResult && !recLoading && (
              <div className="empty-state">
                <div className="empty-state-icon">💡</div>
                <p className="empty-state-text">Click to generate AI-powered product recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
