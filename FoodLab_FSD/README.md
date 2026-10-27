# FoodLab — Food Processing Laboratory Management System (MERN Stack)

A complete **MERN Stack (MongoDB, Express.js, React.js, Node.js)** full-stack application for food-processing quality control, laboratory chemical/microbiological testing, compliance monitoring, and batch traceability.

---

## 🛠️ MERN Stack Architecture

This project is built from the ground up using all 4 core MERN technologies:

| Layer | Technology | Role & Implementation Details |
|---|---|---|
| **M** | **MongoDB & Mongoose** | NoSQL document database. Data models defined with strict Mongoose Schemas (`Batch`, `Sample`, `Test`, `AuditLog`). Includes virtuals, automated compliance status evaluation hooks, and flexible connection support for both local MongoDB and MongoDB Atlas cloud clusters. |
| **E** | **Express.js** | Backend RESTful API server. Implements routing for dashboards, batches, samples, laboratory tests, Certificate of Analysis (COA) generation, CORS, JSON middleware, and centralized error handling. |
| **R** | **React.js** | Single Page Application (SPA) frontend with React 19, hooks (`useState`, `useEffect`, `useMemo`), Lucide React icons, real-time KPI metrics, search & category filtering, interactive test workbench, and printable COA certificates. |
| **N** | **Node.js** | Server-side JavaScript runtime using modern ES Modules (`type: "module"`), environment variables via `dotenv`, and asynchronous event-driven I/O. |

---

## 🔬 Core Features

1. **Laboratory Dashboard**: Live KPIs for Batches, Active Samples, Tests Conducted, Pass/Fail counts, and visual Quality Workload pass rate bar.
2. **Production Batches Management**: Register production batches, link to raw material/finished product samples, with one-click release/hold status actions.
3. **Laboratory Sample Intake**: Track samples across the production pipeline (Raw Material, In-Process, Finished Product, Environmental Swabs).
4. **Chemical & Quality Tests Workbench**: Record test parameters (pH, Brix, Acidity, Microbial Total Plate Count, Moisture, etc.) with real-time automatic specification evaluation (instant Pass/Fail).
5. **Certificate of Analysis (COA) & Traceability**: Full batch-to-sample-to-test lineage report with print-ready accredited COA release certificates.
6. **MERN Architecture Transparency**: Built-in architecture badge and system status modal displaying active MongoDB connection mode, Express API endpoints, and Node.js runtime.

---

## 🚀 How to Run the Project

### 1. Backend (Node.js + Express + MongoDB)
```bash
cd server
npm install
npm run dev
```
- API runs on **http://localhost:5000**
- Health & MERN Status endpoint: **http://localhost:5000/api/health**

#### 🍃 MongoDB Configuration (`server/.env`)
By default, the server connects to local MongoDB:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/foodlab
```

To use **MongoDB Atlas** (Free Cloud Database):
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Copy your connection string into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/foodlab?retryWrites=true&w=majority
   ```
*(Note: If local MongoDB is not running yet during initial launch, the server includes a built-in zero-crash fallback with Mongoose compatibility so you can test the UI immediately).*

### 2. Frontend (React.js + Vite)
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
- Open the Vite URL in your browser (typically **http://localhost:5173** or **http://localhost:5174**).

---

## 📂 Project Structure

```
FoodLab_FSD/
├── client/                      # React Frontend (R in MERN)
│   ├── index.html               # Entry HTML with typography & SEO
│   ├── package.json             # React, Vite, Lucide dependencies
│   ├── vite.config.js           # Vite dev server configuration
│   └── src/
│       ├── main.jsx             # React SPA with Dashboard, Batches, Samples, Tests, COA
│       └── styles.css           # Modern laboratory design system & theme
│
├── server/                      # Node.js + Express Backend (E & N in MERN)
│   ├── .env                     # MongoDB connection & port configuration
│   ├── .env.example             # Template for MongoDB Atlas / Local URI
│   ├── package.json             # Express, Mongoose, Dotenv, Cors
│   └── src/
│       ├── server.js            # Express API server & routes
│       ├── db.js                # MongoDB / Mongoose connection & repository layer
│       └── models/              # MongoDB Schemas & Models (M in MERN)
│           ├── Batch.js         # Production batch Mongoose schema
│           ├── Sample.js        # Laboratory sample Mongoose schema
│           ├── Test.js          # Chemical & quality test Mongoose schema
│           └── AuditLog.js      # QA compliance audit log schema
│
└── README.md                    # Documentation
```
