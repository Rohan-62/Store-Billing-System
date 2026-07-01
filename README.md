# 🏬 Store Billing & Management System

A modern, full-stack Point of Sale (POS) billing and store management application. It features automated billing, intelligent AI assistance, customer loyalty profiling, instant PDF generation, and automated receipt dispatch via WhatsApp Web.

---

## 🚀 Key Features

*   **🛒 POS Billing & Cart Validation**: Searchable product inventory, real-time pricing, stock validation, and coupon calculation.
*   **🤖 AI-Powered Retail Assistant**: Integrated with **Google Gemini AI (`gemini-2.5-flash`)** to analyze store sales data, answer operational queries, and offer cross-selling recommendations.
*   **📲 Instant WhatsApp Invoices**: Automatically launches a headless WhatsApp Web client (via `whatsapp-web.js` + Puppeteer) to text fully formatted invoices to customers upon checkout.
*   **📄 Browser-Side PDF Generation**: Converts POS receipts into beautiful PDF downloads directly in the client browser using `html2pdf.js`, avoiding server-side delays.
*   **🎫 Coupon & Promotion Engine**: Apply fixed or percentage-based discount codes with live validation.
*   **📊 Manager Analytics Dashboard**: Comprehensive summaries of daily/weekly/monthly revenue and interactive transaction log filters.
*   **👥 Automated Customer Profiling**: Tracks purchase history and customer metadata automatically indexed by phone number.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend** | React.js (`v18.x`), Axios, CSS3, `html2pdf.js` |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs` |
| **Database** | MongoDB, Mongoose ODM |
| **Integrations** | Google Gemini SDK (`@google/genai`), Puppeteer / `whatsapp-web.js` |

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT FRONTEND SPA                            │
│    (Billing UI, Invoice Preview, Dashboard, AI Assistant, Analytics)    │
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

## ⚙️ Setup and Installation

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally at `mongodb://127.0.0.1:27017`)

---

### 1. Repository Setup & Dependency Installation

In the root directory of the project, run the pre-configured script to install root, backend, and frontend dependencies at once:

```bash
npm run install-all
```

---

### 2. Environment Configuration

Navigate to the `backend/` directory, create a `.env` file based on [.env.example](file:///d:/Fullstack/store-billing-system/backend/.env.example), and add your API keys:

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and update the variables:

```ini
MONGO_URI=mongodb://127.0.0.1:27017/store-billing
PORT=5000
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 3. Database Seeding (Optional)

To seed mock data for coupons and initial inventory, run the following commands:

```bash
cd backend
node seed_coupons.js
node reseed.js
```

---

### 4. Running the Application

You can spin up both the **Frontend React App** (port `3000`) and the **Backend Express API** (port `5000`) concurrently from the root directory:

```bash
npm start
```

*   **Frontend client**: `http://localhost:3000`
*   **Backend server**: `http://localhost:5000`

---

## 📲 WhatsApp Web Authentication Flow

1. On the first startup, if unauthenticated, the console will print that the WhatsApp client is ready, and the Frontend Dashboard will display a QR code under the WhatsApp Connection card.
2. Scan this QR code using your mobile phone's linked device scanner.
3. The session credentials will save under `backend/.wwebjs_auth/` so that connection persists across backend restarts.
