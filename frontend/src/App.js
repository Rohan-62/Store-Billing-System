import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";

// Components
import BillingForm from "./components/BillingForm";
import BillHistory from "./components/BillHistory";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import AIPage from "./pages/AIPage";
import CouponManager from "./components/CouponManager";
import WhatsAppStatus from "./components/WhatsAppStatus";

const ProductsPage = () => {
  const [editProduct, setEditProduct] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product inventory</p>
      </div>
      <ProductForm 
        editProduct={editProduct} 
        onComplete={() => {
          setEditProduct(null);
          setRefreshTrigger(prev => prev + 1);
        }} 
      />
      <div style={{ marginTop: 24 }}>
        <ProductList 
          onEdit={setEditProduct} 
          refreshTrigger={refreshTrigger} 
        />
      </div>
    </div>
  );
};

const AppLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute>
              <AppLayout>
                <WhatsAppStatus />
                <BillingForm />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute>
              <AppLayout><ProductsPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <AppLayout><BillHistory /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/customers" element={
            <ProtectedRoute>
              <AppLayout><CustomersPage /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/coupons" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout><CouponManager /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/ai" element={
            <ProtectedRoute adminOnly={true}>
              <AppLayout><AIPage /></AppLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
