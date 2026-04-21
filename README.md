# 💍 Thirumana Matrimony

A production-grade matrimonial platform built with **Next.js 14**, **TypeScript**, **Sequelize/MySQL**, **Redux Toolkit**, and **Tailwind CSS**.

---

## 📁 Project Structure

```
matrimonial/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (dashboard)/      # Protected pages: search, profile, subscription, matches
│   ├── api/              # All Next.js API routes
│   │   ├── auth/signup/
│   │   ├── auth/login/
│   │   ├── profile/
│   │   ├── profile/upload/
│   │   ├── religions/
│   │   ├── castes/
│   │   ├── subcastes/
│   │   ├── search/
│   │   ├── subscriptions/
│   │   ├── contact-unlock/
│   │   ├── interests/
│   │   └── profile-views/
│   ├── layout.tsx
│   ├── page.tsx          # Public homepage
│   └── globals.css
├── models/
│   └── index.ts          # All Sequelize models + associations
├── lib/
│   └── db.ts             # MySQL connection
├── store/
│   ├── index.ts          # Redux store
│   ├── hooks.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── userSlice.ts
│       ├── matchSlice.ts
│       └── subscriptionSlice.ts
├── services/
│   └── interestService.ts
├── components/
│   ├── Providers.tsx
│   ├── ui/Navbar.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   └── ContactModal.tsx
│   ├── search/SearchFilters.tsx
│   └── subscription/PlanCard.tsx
├── types/
│   └── index.ts          # All TypeScript interfaces
├── utils/
│   ├── auth.ts           # JWT middleware
│   ├── upload.ts         # Multer config
│   └── helpers.ts        # Shared utilities
└── scripts/
    ├── sync-db.ts        # Create DB tables
    └── seed.ts           # Seed religions/castes/subcastes
```

---

## 🗄️ Database Schema

### Tables
| Table | Key Fields |
|-------|-----------|
| `religions` | id, name |
| `castes` | id, religion_id, name |
| `subcastes` | id, caste_id, name |
| `users` | id, name, email, password, phone, age, gender, religion_id, caste_id, subcaste_id, location, job, salary, bio, profile_image, is_active |
| `subscriptions` | id, user_id, plan_type, contact_limit, contacts_used, expiry_date |
| `contact_views` | id, viewer_id, viewed_user_id |
| `interests` | id, sender_id, receiver_id, status |
| `profile_views` | id, viewer_id, viewed_user_id |

### Sequelize Associations
```
Religion  hasMany  Caste
Caste     belongsTo Religion
Caste     hasMany  SubCaste
SubCaste  belongsTo Caste
User      belongsTo Religion, Caste, SubCaste
User      hasOne   Subscription
```

---

## 🔐 Auth Flow

1. User signs up → password hashed with bcrypt → JWT issued
2. JWT stored in Redux state + `localStorage`
3. All protected API routes verify JWT via `Authorization: Bearer <token>` header
4. `withAuth()` middleware wraps any API handler that needs authentication

---

## 💰 Subscription Plans

| Plan | Price | Contact Views |
|------|-------|--------------|
| Free | ₹0 | 0 |
| Standard | ₹499/mo | 7 |
| Pro | ₹999/mo | 15 |
| Elite | ₹1,999/mo | 30 |

**Contact Unlock Logic:**
- Phone numbers are hidden by default
- On unlock click → check `contacts_used < contact_limit` → show phone + increment count
- If limit reached → show "Upgrade Plan" modal

---

## ⚡ API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login + get JWT |

### Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | ✅ | Get own profile |
| PUT | `/api/profile` | ✅ | Update profile |
| POST | `/api/profile/upload` | ✅ | Upload profile image |

### Religion/Caste
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/religions` | List all religions |
| GET | `/api/castes?religion_id=` | Castes by religion |
| GET | `/api/subcastes?caste_id=` | Subcastes by caste |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search` | ✅ | Search with filters + pagination |

**Query params:** `age_min`, `age_max`, `gender`, `religion_id`, `caste_id`, `subcaste_id`, `location`, `page`, `limit`

### Subscriptions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subscriptions` | ✅ | Get current plan |
| POST | `/api/subscriptions` | ✅ | Upgrade plan |

**Body:** `{ plan_type: "standard" | "pro" | "elite" }`

### Contact Unlock
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact-unlock` | ✅ | Unlock a phone number |

**Body:** `{ target_user_id: number }`

### Interests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/interests?type=received` | ✅ | Get received interests |
| GET | `/api/interests?type=sent` | ✅ | Get sent interests |
| POST | `/api/interests` | ✅ | Send interest |
| PUT | `/api/interests` | ✅ | Accept/reject interest |

### Profile Views
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile-views` | ✅ | Who viewed me |
| POST | `/api/profile-views` | ✅ | Record a profile view |

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 2. Clone & Install
```bash
git clone <repo-url>
cd matrimonial
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=matrimonial_db
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Create MySQL Database
```sql
CREATE DATABASE matrimonial_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Sync Database Tables
```bash
npx ts-node scripts/sync-db.ts
```

### 6. Seed Sample Data
```bash
npx ts-node scripts/seed.ts
```

This seeds: 6 religions → 30+ castes → 100+ subcastes

### 7. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Building for Production

```bash
npm run build
npm start
```

---

## 📦 Redux Store Shape

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  user: {
    profile: User | null,
    loading: boolean,
    error: string | null
  },
  matches: {
    results: User[],
    total: number,
    page: number,
    totalPages: number,
    filters: SearchFilters,
    loading: boolean,
    error: string | null
  },
  subscription: {
    subscription: Subscription | null,
    loading: boolean,
    error: string | null
  }
}
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Redux Toolkit |
| Database | MySQL |
| ORM | Sequelize |
| Auth | JWT + bcrypt |
| File Upload | Next.js FormData API |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Fonts | Playfair Display + DM Sans |

---

## 🔮 Optional Extensions

- **Socket.io Chat**: Add real-time messaging between matched users
- **Email Notifications**: Use Nodemailer/Resend for interest alerts
- **Payment Gateway**: Integrate Razorpay for actual plan purchases
- **Admin Dashboard**: Manage users, verify profiles, view analytics
- **Push Notifications**: PWA service workers for mobile alerts
- **Image Optimization**: Use Sharp to resize/compress uploaded photos

---

## 🐛 Troubleshooting

**MySQL connection error:**
- Check DB_HOST, DB_USER, DB_PASSWORD in `.env.local`
- Ensure MySQL service is running: `sudo service mysql start`

**JWT errors:**
- Make sure JWT_SECRET is set and consistent
- Check Authorization header format: `Bearer <token>`

**Image upload fails:**
- Ensure `public/uploads/` directory exists (auto-created on first upload)
- Check file size < 5MB and format is JPEG/PNG/WebP

---

*Built with ❤️ as a production-ready portfolio project.*
