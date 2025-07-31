# 🏠 House Rental App

A full-stack real estate application built using the **MERN stack** (MongoDB, Express.js, React, Node.js), with **Firebase** for image uploads and **Redux Toolkit** for authentication and user state management. This platform allows users to browse, list, and manage rental properties with a sleek and modern UI powered by **Tailwind CSS**.

---

## 🚀 Features

- 🔐 User authentication (Register/Login with JWT)
- 🏘️ Create, update, and delete property listings
- 🖼️ Upload listing images with Firebase Storage
- 👤 User profile management (edit profile, delete account)
- 🧭 View listing details with image slider
- 📅 Booking or availability calendar (if applicable)
- 🔍 Filter listings (for sale, for rent, offers)
- 🎨 Responsive and modern UI using Tailwind CSS

---

## 🛠️ Tech Stack

**Frontend**:
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- Swiper (for image sliders)

**Backend**:
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT for authentication
- Firebase SDK (for file uploads)

**Other Tools**:
- Vite (React bundler)
- Dotenv for environment variables
- Toastify for alerts
- Firebase Storage for image hosting

---

## 📁 Folder Structure (Brief)

```
house-rental-app/
│
├── backend/               # Node.js + Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes (user, listings)
│   └── controllers/       # Logic for routes
│
├── client/                # React frontend
│   ├── components/        # Reusable components (Header, ListingItem, etc.)
│   ├── pages/             # Route-based pages (Home, Login, Profile, etc.)
│   ├── redux/             # Redux Toolkit slices
│   ├── firebase.js        # Firebase config
│   └── App.jsx            # Main app
│
├── .env                   # Environment variables
├── README.md              # Project documentation
└── package.json           # Project dependencies
```

---

## 🔧 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/house-rental-app.git
cd house-rental-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Run the frontend:

```bash
npm run dev
```

---

## 📸 Screenshots

<img width="1903" height="840" alt="Screenshot 2025-07-31 155327" src="https://github.com/user-attachments/assets/5a3e9eb4-6336-490c-9d60-9fc68ac8cf85" />

<img width="1889" height="914" alt="Screenshot 2025-07-31 155530" src="https://github.com/user-attachments/assets/ef8b63da-4535-4d62-b295-5c282b979710" />

<img width="1881" height="786" alt="Screenshot 2025-07-31 155918" src="https://github.com/user-attachments/assets/d32b7407-5f54-42bb-8c1f-561d7b1233ee" />

<img width="1856" height="826" alt="Screenshot 2025-07-31 160014" src="https://github.com/user-attachments/assets/6633a0da-2467-4790-9888-561ae3779203" />

---

## ✨ Future Improvements

- Booking system or calendar integration
- Admin dashboard for managing users/listings
- Maps integration using Google Maps API
- Chat between tenants and owners

---

## 🧑‍💻 Author

**Parth Dholariya**  
GitHub: [@parth-dholariya](https://github.com/parthdholariya98/house-rental-app.git)


