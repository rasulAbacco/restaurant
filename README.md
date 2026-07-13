# 🍽️ Restaurant Management System

A modern, full-stack Restaurant Management System built to streamline restaurant operations through a centralized platform. The application provides complete management of menu items, inventory, billing, expenses, employees, kitchen operations, and point-of-sale (POS), helping restaurants improve efficiency, reduce operational costs, and deliver a better customer experience.

---

## 🚀 Features

### 🍴 POS (Point of Sale)

- Dine-In, Takeaway & Delivery Orders
- Table Management
- Customer Management
- Split Bills
- Hold & Resume Orders
- Multiple Payment Methods
- Kitchen Order Ticket (KOT)
- Invoice Generation
- Discount & Tax Calculation

---

### 📋 Menu Management

- Menu Categories & Sub Categories
- Menu Item Management
- Variants & Add-ons
- Combo Meals
- Pricing & GST Configuration
- Recipe Mapping
- Kitchen Section Assignment
- Bulk Import & Export
- Availability Management

---

### 📦 Inventory & Stock Management

- Ingredient Management
- Supplier Management
- Purchase Orders
- Stock In / Stock Out
- Recipe-Based Stock Deduction
- Inventory Valuation
- Low Stock Alerts
- Wastage Management
- Expiry Tracking
- Stock Adjustment

---

### 💰 Expense Management

- Expense Categories
- Daily & Monthly Expenses
- Vendor Payments
- Utility Bills
- Salary Expenses
- Asset Purchases
- Petty Cash
- Expense Approval Workflow
- Expense Analytics
- Reports & Export

---

### 👨‍🍳 Kitchen Display System (KDS)

- Real-Time Kitchen Orders
- Kitchen Order Tickets (KOT)
- Order Queue Management
- Cooking Timers
- Station Management
- Priority Orders
- Delay Monitoring
- Chef Performance
- Kitchen Analytics

---

### 👥 Employee & Staff Management

- Employee Registration
- Attendance Management
- Shift Management
- Leave Management
- Salary Management
- Roles & Permissions
- Performance Tracking
- Activity Logs
- Payroll Reports

---

## 📊 Dashboard

- Business Overview
- Revenue Summary
- Sales Analytics
- Expense Summary
- Inventory Overview
- Employee Statistics
- Kitchen Performance
- Operational KPIs

---

## 🔐 Authentication

- JWT Authentication
- Refresh Tokens
- Role-Based Authorization
- Secure Password Hashing
- Protected APIs

---

## 🛠 Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer

---

## 📁 Project Structure

```
restaurant-management-system/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── prisma/
│   ├── src/
│   ├── uploads/
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
cd restaurant-management-system
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

PORT=

CLIENT_URL=
```

### Frontend (.env)

```env
VITE_API_URL=
```

---

## Core Modules

- POS
- Menu Management
- Inventory Management
- Expense Management
- Employee Management
- Kitchen Display System
- Dashboard
- Authentication
- Reports & Analytics

---

## API Modules

```
Authentication
Users
Employees
Menu
Categories
Inventory
Suppliers
Purchase Orders
Expenses
Expense Categories
Orders
POS
Kitchen Display
Customers
Reports
Dashboard
```

---

## Database

Built using **PostgreSQL** with **Prisma ORM**.

Major entities include:

- Users
- Employees
- Roles
- Categories
- Menu Items
- Variants
- Ingredients
- Recipes
- Suppliers
- Inventory
- Purchase Orders
- Expenses
- Orders
- Order Items
- Kitchen Orders
- Customers
- Tables
- Payments
- Reports

---

## Security

- JWT Authentication
- Protected Routes
- Role-Based Permissions
- Password Encryption
- API Validation
- Secure File Uploads

---

## Future Enhancements

- QR Menu Ordering
- Customer Mobile App
- Online Ordering
- Multi-Branch Management
- Loyalty Program
- AI-Based Sales Analytics
- OCR Receipt Scanning
- Kitchen Printer Integration
- Accounting Integration
- Push Notifications

---

## Screenshots

> Add application screenshots here.

```
Dashboard

POS

Menu Management

Inventory

Expense Management

Kitchen Display

Employee Management
```

---

## Deployment

### Frontend

```
Add deployment URL
```

### Backend

```
Add backend URL
```

### Database

```
Add database information
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Author

**Pramod**

GitHub:https://github.com/pramodabacco-sudo/restaurant


---