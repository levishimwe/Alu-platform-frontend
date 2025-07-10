# ALU Graduate Empowerment Platform

A full-stack web application built to empower ALU graduates by showcasing their projects to potential investors and sponsors. This platform allows user registration, login, project submissions, and sponsor browsing — powered by React, Node.js, Express, and MySQL.

---

## 🚀 Tech Stack

### Frontend:
- React (via Create React App)
- Tailwind CSS (for styling)
- Axios (for HTTP requests)
- Context API (for authentication state)

### Backend:
- Node.js + Express
- MySQL (via Sequelize ORM)
- JWT Authentication
- Cloudinary (for media uploads)
- RESTful APIs (JSON-based communication)

---

## 📁 Project Structure

/alu-platform/
│
├── /client/ # Frontend React App
│ ├── /public/
│ ├── /src/
│ │ ├── /components/
│ │ ├── /pages/
│ │ ├── /services/ # Axios services
│ │ ├── /context/ # AuthContext
│ │ └── App.js
│ └── package.json
│
├── /server/ # Backend Node.js API
│ ├── /controllers/
│ ├── /routes/
│ ├── /models/ # Sequelize models
│ ├── /middleware/
│ ├── /config/ # DB config, Cloudinary, etc.
│ └── index.js # Express server entry point
│
├── .env # Environment variables
└── README.md



## ⚙️ Setup Instructions

### 1. Clone the Repository


git clone https://github.com/levishimwe/Alu-platform-frontend.git

cd alu-platform

#### 2. Environment Variables
Create a .env file in /server and include:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=alugrads
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

#### 3. Install Dependencies

Backend

 .npm install
.npm install express sequelize mysql2 dotenv bcryptjs jsonwebtoken swagger-ui-express


### 🚀 Running the Application
1.Start Backend Server

npm run dev

2.Start React Frontend

npm start
Frontend runs on: http://localhost:3000
Backend API runs on: http://localhost:5000/api-docs

🔐 Authentication Flow
JWT is used for secure authentication.

Upon login/register, token is stored in localStorage.

Axios interceptors (or AuthContext) attach token to each request.

### 📦 API Endpoints (Sample)

Method	Endpoint	Description
POST	/auth/register	Register a user
POST	/auth/login	Login and return JWT
POST	/projects/upload	Upload a new project
GET	/projects	Get all approved projects
GET	/user/profile	Fetch logged-in user info

### ✅ Features

👨‍🎓 Graduate + Investor Signup

🖼️ Image and PDF Upload (Cloudinary)

🔒 JWT Auth & Protected Routes

📦 RESTful API with Express

📊 MySQL database with Sequelize

🎨 Modern UI with Tailwind

### 📌 Future Improvements
✅ Admin Panel for Project Moderation

📧 Email Verification

🔍 Project Search & Filter

📱 Mobile Responsiveness

### 👨‍💻 Author
Ishimwe Levis  "i.levis@alustudent.com"
Student, Software Engineering | ALU  "https://github.com/levishimwe/Alu-platform-frontend"

Mission: To become the first professor in software engineering and contribute to Africa’s digital transformation 🌍

## License
This project is open-source and available under the MIT License.
