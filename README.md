# Finance Tracker Web Application

A full-stack web application for managing personal finances and transactions, featuring user authentication, role-based access control, and an admin dashboard.

## Features

### User Features
- 📊 Track income and expenses
- 📈 View financial summaries (balance, total income/expenses)
- ✏️ Add/edit/delete transactions
- 🔐 Secure authentication (JWT)
- 👤 User profile management

### Admin Features
- 👥 Manage users (view/edit/delete)
- 🛠️ Role-based access control (Admin/User)
- 📋 View all user transactions
- 📊 Admin dashboard with system overview

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: EJS Templating, CSS
- **Authentication**: JWT, bcryptjs
- **Middleware**: cookie-parser, method-override
- **Other**: Chart.js (visualizations)

## Installation

1. **Clone the repository**
git clone https://github.com/yourusername/finance-tracker.git](https://github.com/DarinaX2005X/WEB2_Final)
cd finance-tracker
Install dependencies
npm install
Configure environment variables
Create .env file:
PORT=3000
MONGO_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=your_jwt_secret_key
