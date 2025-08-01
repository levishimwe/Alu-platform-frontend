# 🎓 ALU Platform - Graduate Project Showcase & Investor Connection

A modern web platform connecting ALU (African Leadership University) graduates with potential investors — enabling graduates to showcase innovative projects and investors to discover exciting funding opportunities.

---

## 🌟 Features

### For Graduates
- **Project Upload & Management**: Showcase and edit project portfolios
- **Profile Management**: Add skills, achievements, and contact details
- **Dashboard Analytics**: View real-time project engagement stats
- **Messaging System**: Communicate directly with investors

### For Investors
- **Project Discovery**: Explore and search graduate projects
- **Advanced Filtering**: Filter by category, impact area, or keyword
- **Messaging System**: Contact graduates seamlessly
- **Investment Tracking**: Bookmark and follow promising projects

### For Admins
- **Platform Management**: Manage users, content, and analytics
- **Content Moderation**: Review and approve project listings
- **User Management**: Oversee graduate and investor accounts

---

## 🌐 Live Deployment

Experience the platform live without installing anything locally:

### 🚀 Production URLs
- **Frontend**: [alu-platform-frontend-fza9.vercel.app](https://alu-platform-frontend-fza9.vercel.app)
- **Backend API**: [alu-platform.onrender.com/api](https://alu-platform.onrender.com/api)

### 🧱 Deployment Architecture

- **Frontend**: Vercel  
  - Serverless deployment  
  - Global CDN with HTTPS  
  - Auto-deployment from GitHub  

- **Backend**: Render  
  - Node.js Express API  
  - RESTful routes  
  - JWT-based authentication  
  - CORS enabled for frontend access  

- **Database**: MySQL on Google Cloud  
  - Fully managed instance  
  - Daily automated backups  
  - High availability configuration  

### 🧪 Live Test Accounts

Use these credentials to explore platform features:

| Role     | Email                | Password      | Access                                                  |
|----------|----------------------|---------------|----------------------------------------------------------|
| Graduate | graduate@test.com    | password123   | Project management, profile setup, messaging             |
| Investor | investor@test.com    | password123   | Browse projects, contact graduates, investment tracking |
| Admin    | admin@test.com       | password123   | Full platform administration                            |

### ⚙️ Deployment Environment Variables

#### Vercel (Frontend)
```env
REACT_APP_API_BASE_URL=https://alu-platform.onrender.com/api
REACT_APP_CLIENT_URL=https://alu-platform-frontend-fza9.vercel.app
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
```

#### Render (Backend)
```env
DB_HOST=your_google_cloud_mysql_host
DB_USER=your_db_username
DB_PASSWORD=your_secure_db_password
DB_NAME=alu_platform
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=https://alu-platform-frontend-fza9.vercel.app
NODE_ENV=development
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons  
- **Backend**: Node.js, Express.js  
- **Database**: MySQL (Google Cloud hosted)  
- **Auth**: JWT  
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## 📋 Prerequisites

Ensure the following are installed:

- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn
- [MySQL](https://dev.mysql.com/downloads/) (v8+)
- [Git](https://git-scm.com/)

Verify via terminal:
```bash
node --version
npm --version
mysql --version
git --version
```

---

## 🧭 Setup Instructions (Local Development)

### 1. Clone the Repository
```bash

git clone https://github.com/levishimwe/Alu-platform-frontend
//
cd Alu-platform-frontend

```

### 2. Backend Setup

//
```bash

cd backend
## installing dependences
npm install
cp .env.example .env  # or create one manually
```

Edit `.env`:

```env

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=alu_platform
DB_PORT=3306
JWT_SECRET=your_secure_jwt_secret
PORT=5000
NODE_ENV=development
## client url
FRONTEND_URL=http://localhost:3000
```

### 3. Create the Database
Start MySQL and run the SQL commands provided in the original README under "Step 3: Database Setup".

### 4. Start Backend Server
```bash
npm run dev
```

---

## 🖥 Frontend Setup

```bash
cd ../  # root project folder
npm install
 ## intallation of dependences
npm install date-fns
## start frontend
npm start
```

---

## ✅ Verifying Everything Works

- Visit `http://localhost:3000` — React frontend
- Visit `http://localhost:5000` — API should return “ALU Platform API is running”
- Register/login, test dashboards, and messaging

---

## 🗂 Project Structure

```
Alu-platform-frontend/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── src/
│   ├── components/
│   ├── context/
│   ├── styles/
│   ├── App.js
│   └── index.js
```

---

## 🧪 Testing Locally

Use the same credentials listed above for graduate, investor, and admin roles.

---

## 🛠 Troubleshooting

Common problems and solutions:

- **Module not found**  
  ```bash
  rm -rf node_modules
  npm install
  ```

- **Database connection failed**  
  - Check MySQL is running
  - Validate `.env` database credentials

- **Port in use**  
  ```bash
  npx kill-port 3000
  npx kill-port 5000
  ```

- **JWT/CORS issues**  
  - Ensure `JWT_SECRET` is correct
  - Confirm frontend/backend URLs are configured properly

---

## 📞 Support

Need help?  
- Email: [i.levis@alustudent.com]  
- Or refer to the troubleshooting section above.

---

**Built for the ALU community — Empowering graduates with opportunity.**