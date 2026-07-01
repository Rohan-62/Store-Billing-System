# 🏬 Store Billing & Management System — Comprehensive Project Documentation (A-Z)

This document provides complete, end-to-end technical and operational documentation for the **Store Billing & Management System**. It outlines the system architecture, tech stack, feature breakdowns, and detailed explanations of core integrations such as Google Gemini AI, PDF generation, and WhatsApp automated dispatch.

---

## 📐 1. Executive Overview & System Architecture

The **Store Billing & Management System** is a full-stack web application designed for modern retail environments. It automates point-of-sale (POS) billing, inventory tracking, customer relation records, promotional coupon calculations, and real-time business analytics. 

### Core Architectural Pattern: Client-Server REST API
The application uses a decoupled client-server model:
* **Frontend Client (React.js)**: Single Page Application (SPA) serving as the interactive UI for cashiers and store managers.
* **Backend Server (Node.js & Express.js)**: Handles business logic, MongoDB database communication, authentication, background process management (Puppeteer for WhatsApp), and third-party AI integrations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND SPA                            │
│    (Billing UI, Invoice Preview, Dashboard, AI Assistant, Analytics)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP REST API (axios)
┌────────────────────────────────────▼────────────────────────────────────┐
│                           EXPRESS BACKEND SERVER                        │
│   (JWT Auth, Controllers, Mongoose Models, AI & WhatsApp Services)      │
└────────┬──────────────────────┬──────────────────────┬──────────────────┘
         │                      │                      │
┌────────▼─────────┐   ┌────────▼─────────┐   ┌────────▼─────────┐
│     MONGODB      │   │ GOOGLE GEMINI AI │   │  WHATSAPP WEB    │
│   (Persistent    │   │  (gemini-2.5-    │   │ (Headless Chrome │
│    Database)     │   │   flash SDK)     │   │   via Puppeteer) │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 🛠️ 2. Technology Stack & Frameworks

| Layer | Technology / Library | Version / Details | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React.js | `^18.x` | Dynamic, component-based user interface framework |
| **HTTP Client** | Axios | `^1.x` | Asynchronous API requests between React & Express |
| **PDF Engine** | `html2pdf.js` | Client-side bundle | Client-side html-to-canvas-to-pdf rendering |
| **Backend Core** | Node.js | Runtime | Asynchronous, event-driven JavaScript backend engine |
| **Web Framework** | Express.js | `^4.18.2` | REST API routing and middleware management |
| **Database** | MongoDB & Mongoose | `^7.6.3` | NoSQL document database and Object Data Modeling (ODM) |
| **Security** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` | `^9.0.3` / `^3.0.3` | Authentication and password hashing |
| **Artificial Intelligence** | `@google/genai` | `^2.10.0` | Official Google Gemini API SDK (`gemini-2.5-flash`) |
| **WhatsApp Automation**| `whatsapp-web.js` & `qrcode` | `^1.34.7` / `^1.5.4` | Headless WhatsApp Web client automation via Puppeteer |

---

## 🧠 3. Artificial Intelligence Integration (Google Gemini AI)

### Overview
The application incorporates **Google Gemini AI** (`gemini-2.5-flash`) to transform standard retail data into actionable business intelligence and real-time recommendations.

### How it is Connected to the Application
1. **SDK Initialization**: In `backend/services/aiService.js`, the `@google/genai` SDK is instantiated using the `GEMINI_API_KEY` configured in environment variables.
2. **Context-Aware Prompt Engineering**: Rather than sending isolated prompts, the server queries the local MongoDB database for relevant statistics, aggregates the data into structured context strings, and appends the user's query or task before sending it to Gemini.

### Key AI Powered Features:
* **🤖 Smart Retail Assistant (`queryAssistant`)**: Allows managers to ask natural language questions regarding inventory status, stock alerts, and store operational statistics.
* **📈 Trend Analysis & Insights (`getTrendAnalysis`)**: Aggregates the past 30 days of bill revenue, total sales, and top-selling items, passing this dataset to Gemini to extract key trend insights and business growth recommendations.
* **🛍️ Cross-Selling Product Recommendations (`getProductRecommendations`)**: Analyzes current cart items alongside historical co-purchase patterns in MongoDB to dynamically suggest complementary items to cashiers during checkout.

---

## 📄 4. PDF Invoice Generation (`html2pdf.js`)

### Overview
Instead of requiring server-side rendering engines (like PDFKit or Puppeteer on the server), invoice PDFs are generated directly in the user's browser, maximizing speed and reducing server load.

### How PDF Generation Works:
1. **DOM Representation**: In `frontend/src/components/BillingForm.js`, when a bill is created, an invoice container `<div id="invoice">` is dynamically rendered with store branding, customer details, product tables, subtotal, discounts, and final totals.
2. **Canvas Capture & Conversion**: When the user clicks **"Download PDF"**, `html2pdf.js` executes:
   * **Phase 1 (HTML to Canvas)**: Uses `html2canvas` to capture the specified HTML element and render it into an internal HTML5 `<canvas>`.
   * **Phase 2 (Canvas to PDF)**: Converts the canvas bitmap into a vector PDF document using `jsPDF`.
3. **Download Delivery**: The generated `.pdf` file is immediately downloaded by the browser with a customized filename formatted as `Invoice_<Mobile>_<Timestamp>.pdf`.

---

## 📲 5. WhatsApp Automation & Connection (`whatsapp-web.js`)

### Overview
The application connects directly to WhatsApp Web to automatically dispatch formatted digital invoices to customers' WhatsApp numbers as soon as a transaction is completed.

### How WhatsApp is Connected:
1. **Headless Chrome Client**: In `backend/services/whatsapp.js`, `whatsapp-web.js` launches a headless Chromium instance managed via Puppeteer in the background.
2. **Persistent Authentication (`LocalAuth`)**: Uses `LocalAuth` strategy to store session credentials under the `.wwebjs_auth` directory, ensuring the store does not need to re-scan the QR code upon server restarts.
3. **QR Code Connection Flow**:
   * If unauthenticated, the client emits a `qr` event.
   * The backend converts the raw string into a Data URL image via `qrcode.toDataURL()` and serves it to the React frontend (`WhatsAppStatus.js`).
   * Store personnel scan the QR code with their mobile device to establish a persistent connection.
4. **JID Resolution & Dispatch (`sendInvoice`)**:
   * **Phone Number Cleaning**: Extracts raw digits from customer inputs.
   * **API Registration Lookup (`getNumberId`)**: Queries WhatsApp servers via `client.getNumberId()` to resolve the exact WhatsApp internal ID (`_serialized` JID, e.g., `919876543210@c.us` or `@lid`). If missing country code, it automatically checks with default region prefixes.
   * **Message Dispatch**: Formats a clean text invoice with itemization and totals, sending it directly to the customer's WhatsApp chat via `client.sendMessage()`.

---

## 🧩 6. Feature-by-Feature Breakdown (A-Z Details)

### A. Authentication & Role-Based Security
* **JWT Security**: Protects backend routes via bearer tokens (`middleware/auth.js`).
* **Role Management**: Differentiates between `admin` and standard cashier users, restricting access to sensitive actions (e.g., store analytics and stock updates).

### B. POS Billing & Checkout System (`BillingForm.js`)
* **Live Product Selection**: Real-time searchable catalog for adding items to cart.
* **Stock Validation**: Prevents adding items exceeding available inventory.
* **Automatic Invoice Dispatch**: Triggers simultaneous PDF generation availability and instant WhatsApp message delivery upon checkout.

### C. Promotional Coupon Engine (`couponRoutes.js`)
* **Dynamic Discounts**: Supports fixed amount (e.g., `$5 off`) and percentage-based (e.g., `10% off`) promotions.
* **Real-time Validation**: Calculates subtotal adjustments instantly in the billing cart interface.

### D. Customer Management & History (`Customer.js`)
* **Auto-Customer Profile**: Automatically creates customer records upon billing based on unique mobile numbers.
* **Transaction History**: Tracks historical purchases per customer for loyalty insights.

### E. Inventory & Stock Management (`productRoutes.js`)
* **CRUD Operations**: Complete control over product catalog, pricing, cost margins, and categories.
* **Low Stock Alerts**: Identifies items falling below specified `lowStockThreshold` values.

### F. Analytics Dashboard (`DashboardPage.js` & `BillHistory.js`)
* **Revenue Metrics**: Calculates daily, weekly, monthly, and overall lifetime store turnover.
* **Visual Data Tables**: Detailed expandable transaction logs with filtering capabilities by date range and phone number.
