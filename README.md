# SocialPlug

SocialPlug is a modern SaaS platform that enables seamless cloud-based media uploads, management, and sharing using **Cloudinary** integration.  
It’s built with a scalable architecture using **Next.js** and supports user authentication, media organization, and optimized delivery.

---

## 🚀 Features

- **Cloudinary Integration** – Upload, store, and optimize images and videos.
- **User Authentication** – Secure signup/login with JWT-based access control.
- **Responsive UI** – Optimized for both desktop and mobile using Tailwind CSS.
- **Media Management** – Categorize and manage uploaded content easily.
- **Performance Optimized** – Built with Next.js for SSR, lazy loading, and CDN delivery.
- **Scalable Architecture** – Full-stack Next.js application designed for future SaaS enhancements.

---

## 🛠 Tech Stack

- **Framework:** Next.js (with React)
- **Styling:** Tailwind CSS
- **Database:** MongoDB
- **ORM:** Prisma
- **Cloud Storage:** Cloudinary
- **Authentication:** JWT + bcrypt
- **Deployment:** Vercel / Render / Railway

---

## 📂 Folder Structure

Your project uses the **Next.js App Router**, which organizes the application by features and routes.

```plaintext
SocialPlug/
├── app/                      # Main application folder
│   ├── (app)/                # Route group for authenticated pages
│   │   ├── home/
│   │   └── video-upload/
│   ├── (auth)/               # Route group for authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── api/                  # API routes (backend logic)
│   │   ├── image-upload/
│   │   └── video-upload/
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
│
├── components/               # Reusable React components
│   ├── SocialShareClient.tsx
│   └── VideoCard.tsx
│
├── prisma/                   # Prisma schema and client
│   └── schema.prisma
│
├── public/                   # Static assets (images, fonts)
├── middleware.ts             # Next.js middleware for auth
├── next.config.ts            # Next.js configuration
├── package.json
└── .env.local                # Environment variables (untracked)
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/SocialPlug.git
cd SocialPlug
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
# Prisma
DATABASE_URL="your_mongo_uri"

# JWT
JWT_SECRET="your_jwt_secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 4️⃣ Sync Database Schema
```bash
npx prisma db push
```

### 5️⃣ Run the Development Server
```bash
npm run dev
```
The app will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## 📸 Screenshots
*(Add screenshots of your app here)*
<img width="1917" height="878" alt="image" src="https://github.com/user-attachments/assets/2225e3eb-d148-49cf-bc28-cf253674616d" />
<img width="1904" height="869" alt="image" src="https://github.com/user-attachments/assets/3d598a7e-9941-4727-b4a8-43359c06745d" />

---

## 💡 Future Enhancements

- Social media integrations
- Video streaming & editing tools
- AI-powered image tagging
- Multi-user team workspaces

---

## 📜 License
This project is licensed under the **MIT License** – feel free to modify and use it for your own SaaS projects.
