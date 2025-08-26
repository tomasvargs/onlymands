# 🛍️ Onlymands — A Modern JavaScript-Based E-Commerce Platform

onlymands is a sample e-commerce web application built with JavaScript, offering a seamless shopping experience from user registration to secure payment via Razorpay.
---

## 🚀 Features

- 🔐 **User Authentication**
  - Sign up, login, and session management
  - Secure password handling and validation

- 🛒 **Product Browsing**
  - Dynamic product listing with category filters
  - Individual product detail pages

- 🧺 **Cart Management**
  - Add/remove items from cart
  - Quantity updates and price calculation

- 📦 **Order Placement**
  - Checkout flow with address and order summary
  - Order history and status tracking

- 💳 **Payment Integration**
  - Razorpay gateway for secure transactions
  - Real-time payment status updates

---

## 🧰 Tech Stack

| Layer         | Technology                |
|--------------|---------------------------|
| Frontend     | HTML, CSS, JavaScript     |
| Backend      | Node.js, Express.js       |
| Database     | MongoDB (via Mongoose)    |
| Auth         | JWT, bcrypt               |
| Payment      | Razorpay API              |
| Deployment   | Render / Vercel / Heroku  |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tomasvargs/onlymands.git
cd jscommerce

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your MongoDB URI, JWT secret, and Razorpay keys

# Start the server
npm start
