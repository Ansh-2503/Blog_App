# DevPulse

DevPulse is a full-stack, modern blogging platform designed for creators and readers in the software engineering and tech ecosystem. It features robust authentication, rich-text article creation, user profile management, interactive reading experiences, and comprehensive security measures.

## 🚀 Key Features

* **Advanced Authentication Flow:** 
  * Email/Password login with secure OTP (One-Time Password) email verification.
  * Google OAuth2 integration for seamless social sign-on.
  * Secure JWT-based session management using `HttpOnly` and `Secure` cookies.
  * Forgot/Reset password flows with temporary cryptographic tokens.
* **Role-Based Access Control (RBAC):**
  * **Visitor:** Read articles, like posts, and manage their personal profile.
  * **Creator:** Access to the creator dashboard, rich-text article authoring, and publishing controls.
* **Content Creation & Consumption:**
  * Rich-text HTML editor for writing beautiful, formatted articles.
  * Automated slug generation and SEO tag management.
  * Client-side PDF generation allowing users to download articles for offline reading.
  * Unique view tracking and article "like" toggles.
* **Profile Management:**
  * Custom user avatars via Cloudinary integration.
  * Client-side image compression to optimize bandwidth before uploading.
  * Bios, usernames, and configurable account settings.
* **Security & Hardening:**
  * Rate-limiting to prevent DDoS and brute-force attacks.
  * Deep input validation using `Zod` on both the frontend and backend.
  * `DOMPurify` to mitigate Stored Cross-Site Scripting (XSS) vulnerabilities.
  * Standardized JSON API responses and custom middleware error handlers.

## 🛠️ Technology Stack

### Frontend
* **Framework:** Next.js (App Router), React
* **Styling:** Tailwind CSS, ShadCN UI
* **State Management:** Zustand
* **Form & Validation:** React Hook Form, Zod
* **Icons & Visualization:** Lucide React, Recharts
* **Utilities:** DOMPurify (XSS prevention), React PDF Renderer

### Backend
* **Environment:** Node.js, Express.js
* **Database:** MongoDB & Mongoose
* **Authentication:** JWT, bcrypt, Google Auth Library
* **File Uploads:** Multer, Cloudinary
* **Emails:** Nodemailer
* **Security:** Helmet, Express Rate Limit, Zod

## 📂 Project Structure

```text
.
├── backend/
│   ├── controllers/      # Route logic and request handling
│   ├── middlewares/      # Auth protection, RBAC, and Zod validation schemas
│   ├── models/           # Mongoose schemas (User, Post, OTP, PostView)
│   ├── routes/           # Express route definitions (authRoutes, postRoutes)
│   ├── services/         # Core business logic (DB queries, 3rd party APIs)
│   ├── utils/            # Helper functions (Cloudinary config, Nodemailer)
│   └── index.js          # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── app/          # Next.js App Router (pages and layouts)
    │   ├── components/   # Reusable UI components (auth, blog, layout, settings)
    │   ├── context/      # Zustand state stores (e.g., auth-store)
    │   ├── lib/          # Utilities, API client wrapper, formatters
    │   └── types/        # TypeScript interfaces and definitions
    ├── package.json
    └── next.config.js
```

## ⚙️ Local Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB instance (local or Atlas)
* Cloudinary Account
* Google Cloud Console Project (for OAuth)

### 1. Clone the repository
```bash
git clone <repository-url>
cd Blog_App
```

### 2. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
COOKIE_SECRET=your_cookie_secret

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLIENT_URL=http://localhost:3000
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📜 License
This project is licensed under the MIT License.
