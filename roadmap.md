# IEEE SB QR ID Card System - Detailed Project Roadmap

## Project Overview
- An internal web application for the IEEE Student Branch (SB) for College of Engineering, Cherthala (CECTL) that powers QR-code-based digital ID cards.
- Each physical ID card has a QR code on the back. When scanned (on a phone), it opens a public profile page showing that member's details. 
- An admin panel allows a single admin to manage all member profiles (add, edit, delete).

> [!NOTE]
> This repository contains the application source code only. Deployment credentials, environment variables, and production configuration are intentionally excluded.

## Core Features

### Public Side
- Route: `/profile/:id`.
- Displays a member's profile card.
- Mobile-first design (since QR scans happen on phones).
- No login required to view.

### Admin Panel
- Route: `/admin`.
- Password-protected (single admin).
- Dashboard: list of all members.
- CRUD operations: Get/Add/Edit/Delete member.
- Photo upload (to Cloudinary) - only AVIF format (for efficiency).
- QR code generation & download per member.
- On member deletion: auto-delete their photo from Cloudinary.

## Member Profile Fields

| Field | Type | Notes |
|---|---|---|
| `id` | UUID / auto-increment | Used in QR code URL |
| `name` | String | Full name |
| `photo` | String (URL) | Hosted on Cloudinary |
| `cloudinary_public_id` | String | Stored in DB for deletion |
| `position` | String | e.g. "Chairperson", "Secretary" |
| `department` | String | e.g. "Computer Science" |
| `batch` | String | e.g. "2023 - 2027" |
| Social links | Strings | Phone Number, Email, Instagram, LinkedIn, GitHub, Snapchat, or more - flexible |

> **Note:** Final list of social link fields to be decided later. Design the schema to be flexible (consider a JSON column for socials or individual nullable columns).

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | React (Vite) | No need of SEO |
| **Backend** | Node.js + Express | Familiar, lightweight |
| **Database** | SQLite (`better-sqlite3`) | Zero cost, no DB server, single file on Railway with backend itself |
| **Image Hosting** | Cloudinary | Free tier (25GB), easy API, auto-delete support |
| **QR Generation** | `qrcode` npm package | Server-side generation |
| **Auth** | JWT with admin credentials in `.env` | Single admin, no user management needed |
| **Image Format** | AVIF | Smaller file sizes |

---

## Hosting Plan

| Service | What it hosts | Cost |
|---|---|---|
| **Vercel** | React frontend | Free |
| **Railway** | Express backend + SQLite DB file | Free tier (500 hrs/mo) |
| **Cloudinary** | Member photos | Free (25GB storage + 25GB bandwidth/mo) |
| **Custom Domain** | Already owned - `ieeesbcectl.in` | ~Rs. 600/yr (already paid) |

### Domain Routing

| Subdomain | Points to | Purpose |
|---|---|---|
| `id.ieeesbcectl.in` | Vercel (CNAME) | React frontend - profile pages & admin panel |
| `api.ieeesbcectl.in` | Railway (CNAME) | Express backend API |

- Existing site at `www.ieeesbcectl.in` is unaffected - subdomains are independent.
- Subdomains cost nothing extra - they are free DNS records on the existing domain.
- QR codes will encode URLs like: `https://id.ieeesbcectl.in/profile/:id`.
- Admin panel will be at: `https://id.ieeesbcectl.in/admin`.
- DNS setup: add two CNAME records in domain registrar settings.

### Why not SQLite on Vercel?
- Vercel uses serverless functions with ephemeral (reset) filesystems - SQLite's `.db` file would be wiped on every deploy.
- Railway has a persistent filesystem, so the SQLite file is safe there.

### Why split frontend/backend?
- Vercel is purpose-built for static/React frontends (global CDN, automatic builds).
- Railway is purpose-built for backend servers (persistent process, persistent filesystem).
- Both free, both optimal for their role.

## Authentication

- Single admin only - no multi-user auth needed.
- Credentials stored in `.env` on Railway:
  ```
  ADMIN_USERNAME=<admin_username>
  ADMIN_PASSWORD=<admin_secure_password>
  JWT_SECRET=<jwt_secret>
  ```
- Admin logs in → receives JWT → stores in `localStorage` → sends as `Authorization: Bearer <token>` header on all admin API calls.

## Cloudinary Auto-Delete on User Deletion

- When a member is deleted from the admin panel:
  1. Backend fetches `cloudinary_public_id` from DB.
  2. Calls `cloudinary.uploader.destroy(public_id)` via Cloudinary SDK.
  3. Deletes DB record.
- This means the admin never has to manually delete from Cloudinary. The `cloudinary_public_id` must always be saved to the DB at upload time.

## QR Code Strategy

- QR codes encode a URL like: `https://yourdomain.com/profile/:id`.
- Generated server-side using the `qrcode` npm package.
- Admin can download the QR as a PNG from the admin panel.
- QR codes can be printed on the back of physical ID cards.

## Estimated Project Structure

```
ieeesb-revamp/
├── frontend/                     ← React (Vite) app → deploy to Vercel
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ProfilePage.jsx     ← Public profile view (/profile/:id)
│   │   │   ├── AdminLogin.jsx      ← Admin login page
│   │   │   └── AdminDashboard.jsx  ← Admin panel
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
│
└── backend/                     ← Express app → deploy to Railway
    ├── index.js                ← Entry point
    ├── database.db             ← SQLite file (auto-created, persists on Railway)
    ├── db.js                   ← SQLite connection & schema setup
    ├── routes/
    │   ├── auth.js             ← POST /api/auth/login
    │   ├── members.js          ← GET/POST/PUT/DELETE /api/members
    │   └── qr.js               ← GET /api/qr/:id
    ├── middleware/
    │   └── authMiddleware.js   ← JWT verification
    └── package.json
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Admin login, returns JWT |
| `GET` | `/api/members` | ✅ | List all members (admin) |
| `GET` | `/api/members/:id` | ❌ | Get single member (public profile) |
| `POST` | `/api/members` | ✅ | Add new member |
| `PUT` | `/api/members/:id` | ✅ | Update member details |
| `DELETE` | `/api/members/:id` | ✅ | Delete member + Cloudinary photo |
| `GET` | `/api/qr/:id` | ✅ | Generate & return QR code PNG |

## UI/UX Design System

The ID card system will perfectly match the main `www.ieeesbcectl.in` website's theme to maintain brand consistency.

### 🎨 Primary Visual Reference
> **The personal info page (`/profile/:id`) must look like `ID_Card_Main_Image.jpeg`.**
> Keep the reference image at: `ID_Card_Main_Image.jpeg` (in this repo root) for accurate visual guidance.

**What the reference image shows:**
- Dark card on a dark background — deep contrast, premium feel
- **IEEE / CECTL logo** centered at the very top of the card
- **Circular profile photo** with a subtle glowing ring/border accent
- **Member name** in large bold text (Anton SC) directly below the photo
- **Role / Position label** immediately under the name (slightly smaller, styled differently)
- **Department** and **Batch** in smaller secondary text below role
- A **horizontal divider line** separating the info section from the social links area
- A **row of social media icons** at the bottom (LinkedIn, GitHub, Email visible; others optional)
- **Rounded corners** on the card (`border-radius: ~16–24px`)
- Subtle **gradient or glow** as a decorative accent (purple/blue tones visible in the reference)
- Very clean, minimal **vertical layout** — everything centered
- Card fills **most of the screen width** on mobile (≈ `90vw`, max ~420px)
- Overall: a **digital ID card** feel, not a webpage feel

**Additional inspiration from `ID_Card_Image1.jpeg` and `ID_Card_Image2.jpeg`:**
- Multiple mockup angles showing gradient-border circular avatars
- IEEE logo placement variations
- Social link row treatment
- Dark card, dark background — consistent aesthetic throughout

---

### Typography
- **Headings / Name:** `Anton SC` (Bold, impactful, modern tech feel)
- **Body / Info text:** `Montserrat` (Clean, highly readable sans-serif)
- **Accents / Labels:** `Urbanist`
- Load from Google Fonts in `index.html`

### Color Palette (Dark Theme)
- **Background (Main):** Eerie Black (`hsla(210, 4%, 9%, 1)`)
- **Card Background:** Darker Blue-Grey (`hsl(213, 11%, 13%)`)
- **Text (Primary):** White (`#ffffff`)
- **Text (Secondary):** Light Grey (`#d4d4d4`)
- **Accent Glow / Border:** Subtle purple-blue gradient (e.g. `linear-gradient(135deg, #6C63FF, #3B82F6)`)
- **Shadows:** `0px 0px 25px 0px hsla(0, 0%, 0%, 0.25)`
- **Divider line:** `rgba(255,255,255,0.12)`

### ProfilePage Layout (Mobile-first)
```
┌─────────────────────────────────┐
│         IEEE / CECTL Logo        │  ← centered, top padding ~32px
│                                  │
│          ╭──────────╮            │  ← circular photo, ~120px dia
│          │  PHOTO   │            │     with gradient ring border
│          ╰──────────╯            │
│                                  │
│         FULL NAME HERE           │  ← Anton SC, ~28px, white
│          Role / Position         │  ← Montserrat, ~16px, #d4d4d4
│       Department · Batch         │  ← smaller, #d4d4d4, ~14px
│                                  │
│    ─────────────────────────     │  ← thin divider, rgba white
│                                  │
│    [🔗] [⚙️] [✉] [📸] [...]    │  ← social icon row, ~32px each
│                                  │
└─────────────────────────────────┘
```

### Card Specs
| Property | Value |
|---|---|
| Width | `min(90vw, 420px)` |
| Background | `hsl(213, 11%, 13%)` |
| Border-radius | `20px` |
| Box-shadow | `0 8px 40px rgba(0,0,0,0.5)` |
| Photo diameter | `120px` |
| Photo border | `3px solid` gradient (purple → blue) |

### Social Icons Row
- Icons: LinkedIn, GitHub, Email as minimum; optionally Instagram, Snapchat, Phone
- Only render icons for fields that are **not empty** in the DB
- Use a consistent icon library (e.g. `react-icons`)
- Clicking an icon opens the link in a new tab (email opens `mailto:`)

### Aesthetics & Vibe
- Modern, premium dark mode UI.
- Clean **card-based** layout — the card IS the page on mobile.
- Smooth micro-interactions: hover scale on social icons (`transform: scale(1.1)`).
- Mobile-first — the whole experience is designed for a phone screen (QR scanned on phone).
- No sidebar, no navbar on the public profile page — pure fullscreen card aesthetic.
- Center the card vertically in the viewport on tall screens.

### Edge States (UI)
- **Loading State:** While fetching `/api/members/:id`, display a subtle skeleton loader or a minimalist spinner matching the dark theme to avoid jarring layout shifts.
- **Not Found State (404):** If a QR code is scanned for a deleted member, display a clean, dark-themed "Member Not Found" card instead of a blank screen or raw JSON error.

## Key Dependencies (npm)

### Backend
```
express
better-sqlite3
cloudinary
qrcode
jsonwebtoken
bcryptjs
cors
dotenv
multer         ← for handling file uploads before sending to Cloudinary
express-rate-limit ← prevent spamming of public endpoints
helmet         ← basic HTTP security headers
```

### Frontend
```
react
react-router-dom
axios
```

## Notes & Decisions Log

- No MongoDB/PostgreSQL - SQLite is sufficient for 100–200 members and eliminates DB hosting costs entirely
- No Google Drive for images - Direct Drive links are unreliable, break frequently, not CDN-served
- Cloudflare R2 was considered as alternative to Cloudinary (10GB free, no egress fees) but Cloudinary chosen for easier setup and SDK support
- AVIF image format preferred by the team for smaller file sizes - Cloudinary supports AVIF natively
- Vercel not suitable for backend because serverless functions have ephemeral filesystems (SQLite would reset on every deploy)
- Railway chosen over Render - Render's free tier spins down after 15 min of inactivity (slow cold starts); Railway keeps the process alive
- Single admin - no role-based access control needed; JWT with hardcoded `.env` credentials is sufficient
- **State Management:** Standard React `useState`/`useEffect` is sufficient. No Redux or external state libraries needed.
- **Form Submission:** Frontend must use `FormData` (multipart/form-data) when submitting member data with images, rather than standard JSON payloads.
- **CORS Strategy:** While testing locally, CORS is open. In production, CORS should be restricted to the Vercel frontend URL to prevent unauthorized API consumption.
- **Socials JSON Structure:** The `socials` column in SQLite expects a flat JSON object (e.g., `{ "linkedin": "...", "github": "...", "email": "..." }`).

## Implementation Phases

To avoid token limits and manage the project systematically, work can be completed in the following incremental phases:

### Phase 1: Project Initialization & Database Setup
- Initialize the repository with `frontend/` and `backend/` directories.
- Set up the Express.js server and install backend dependencies.
- Configure `better-sqlite3` and create the initial database schema (members table).
- Set up `.env` configurations for local development.

### Phase 2: Authentication & Core API (Backend)
- Implement the admin login endpoint (`/api/auth/login`) with JWT generation.
- Create the JWT authentication middleware to protect admin routes.
- Set up security middleware (`helmet`, `express-rate-limit`).
- Implement basic member CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) without file uploads initially.

### Phase 3: Cloudinary Integration & Image Uploads (Backend)
- Integrate `multer` for handling multipart/form-data.
- Configure Cloudinary SDK for image uploads (enforcing AVIF format).
- Update the member creation and update endpoints to handle image uploads and store the `cloudinary_public_id`.
- Implement the auto-delete logic in the member deletion endpoint.

### Phase 4: QR Code Generation (Backend)
- Implement the `/api/qr/:id` endpoint using the `qrcode` package.
- Ensure it returns a downloadable PNG.

### Phase 5: Frontend Foundation & Admin Panel (frontend)
- Initialize the React (Vite) frontend and install client/frontend dependencies (React Router, Axios, Tailwind/CSS).
- Build the Admin Login page and handle JWT storage in `localStorage`.
- Build the Admin Dashboard: list all members, add new members (with photo upload), edit, and delete.
- Add QR code download functionality to the dashboard.

### Phase 6: Public Profile Card UI (frontend)
- Build the public `/profile/:id` page.
- Match the exact UI specifications from `ID_Card_Main_Image.jpeg`.
- Implement dynamic rendering of social links based on database fields.

### Phase 7: Deployment & DNS Configuration
- Instruct the user to deploy the Express backend to Railway (configure persistent volume for SQLite).
- Instruct the user to deploy the React frontend to Vercel.
- Instruct to configure DNS CNAME records (`api.ieeesbcectl.in` and `id.ieeesbcectl.in`).
- Final end-to-end testing of the live system by user.
- Create admin user if not already done. Guide the user about entire site usage.