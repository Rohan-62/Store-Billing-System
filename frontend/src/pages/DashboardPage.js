import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bills/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="spinner" />;
  if (!data) return <div className="empty-state"><p>Unable to load analytics</p></div>;

  const { stats, dailyRevenue, topProducts, profitData, lowStock } = data;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Business analytics overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-value">${stats.today.revenue.toFixed(2)}</div>
          <div className="stat-sub">{stats.today.count} bills</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-label">This Week</div>
          <div className="stat-value">${stats.week.revenue.toFixed(2)}</div>
          <div className="stat-sub">{stats.week.count} bills</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-label">This Month</div>
          <div className="stat-value">${stats.month.revenue.toFixed(2)}</div>
          <div className="stat-sub">{stats.month.count} bills</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-label">All Time</div>
          <div className="stat-value">${stats.total.revenue.toFixed(2)}</div>
          <div className="stat-sub">{stats.total.count} total bills</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        {/* Revenue Chart */}
        <div className="chart-card">
          <div className="chart-card-title">Revenue Trend (30 Days)</div>
          <div className="chart-card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="chart-card">
          <div className="chart-card-title">Top Products by Revenue</div>
          <div className="chart-card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row — Profit & Low Stock */}
      <div className="chart-grid">
        {/* Profit Margins */}
        <div className="chart-card">
          <div className="chart-card-title">Profit Margins (%)</div>
          <div className="chart-card-body">
            {profitData.length === 0 ? (
              <div className="empty-state">
                <p className="text-muted small">No cost price data — add cost prices to products</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)'
                    }}
                    formatter={(value) => [`${value}%`, 'Margin']}
                  />
                  <Bar dataKey="margin" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="chart-card">
          <div className="chart-card-title">Low Stock Alerts</div>
          <div className="chart-card-body">
            {lowStock.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <p className="empty-state-text">All products are well stocked</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ color: '#dc2626', fontWeight: 700 }}>{p.stock}</td>
                        <td>{p.threshold}</td>
                        <td>
                          <span className="badge bg-danger">
                            {p.stock === 0 ? 'OUT OF STOCK' : 'LOW'}
                          </span>
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
